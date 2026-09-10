import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const MESSAGES_DIR = path.join(ROOT_DIR, 'messages');

const TARGET_LOCALES = ['es', 'de', 'fr'];
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct:free';

// Strict schema ensuring AI output is a flat key-value dictionary of strings
const TranslationSchema = z.record(z.string(), z.string());

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Flatten nested objects into dot-notated key-value maps
function flatten(obj, prefix = '') {
  let res = {};
  for (const [key, val] of Object.entries(obj)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(res, flatten(val, nextKey));
    } else {
      res[nextKey] = String(val);
    }
  }
  return res;
}

// Reconstitute flat dot-notated map back into deeply nested JSON
function unflatten(flat) {
  const result = {};
  for (const [dotKey, val] of Object.entries(flat)) {
    const keys = dotKey.split('.');
    let cur = result;
    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i];
      cur[part] = cur[part] || {};
      cur = cur[part];
    }
    cur[keys[keys.length - 1]] = val;
  }
  return result;
}

// Call OpenRouter with exponential backoff & jitter
async function translateBatchWithBackoff(sourceMap, targetLocale, retries = 3) {
  if (Object.keys(sourceMap).length === 0) return {};

  const systemPrompt = `You are a professional software localization system. 
Translate the key-value JSON dictionary from English into target locale: '${targetLocale}'.
Rules:
1. Return strictly a raw valid JSON object. No markdown backticks, no conversational text.
2. Maintain identical keys.
3. Preserve all ICU variables and interpolation tokens exactly (e.g. {count}, {name}, {price}).`;

  const payload = {
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(sourceMap, null, 2) },
    ],
    temperature: 0.2,
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://localiza.dev',
          'X-Title': 'Localiza-Engine',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenRouter HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      let rawContent = json?.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        throw new Error('Empty response from translation model');
      }

      // Strip markdown code fences if model accidentally emits them
      if (rawContent.startsWith('```')) {
        rawContent = rawContent.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      }

      const parsed = JSON.parse(rawContent);
      // Validate schema via Zod
      return TranslationSchema.parse(parsed);
    } catch (err) {
      console.warn(`[Attempt ${attempt}/${retries}] Failed to translate for '${targetLocale}': ${err.message}`);
      if (attempt === retries) throw err;
      // Exponential backoff + random jitter
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
      await sleep(delay);
    }
  }
}

async function runLocalizationSync() {
  if (!OPENROUTER_API_KEY) {
    console.log('\x1b[33m%s\x1b[0m', '⚠ OPENROUTER_API_KEY is not defined in .env.local.');
    console.log('Skipping remote AI sync. Existing files remain intact.');
    return;
  }

  const namespaces = ['common.json', 'marketing.json', 'dashboard.json', 'pricing.json'];

  for (const ns of namespaces) {
    const enFilePath = path.join(MESSAGES_DIR, 'en', ns);
    if (!fs.existsSync(enFilePath)) continue;

    const enSource = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
    const enFlat = flatten(enSource);

    for (const locale of TARGET_LOCALES) {
      const targetDir = path.join(MESSAGES_DIR, locale);
      fs.mkdirSync(targetDir, { recursive: true });
      const targetFilePath = path.join(targetDir, ns);

      let targetFlat = {};
      if (fs.existsSync(targetFilePath)) {
        try {
          targetFlat = flatten(JSON.parse(fs.readFileSync(targetFilePath, 'utf8')));
        } catch {
          targetFlat = {};
        }
      }

      // Compute diff: what keys exist in EN that are missing in target?
      const missingKeys = {};
      for (const [key, value] of Object.entries(enFlat)) {
        if (!targetFlat[key]) {
          missingKeys[key] = value;
        }
      }

      const missingCount = Object.keys(missingKeys).length;
      if (missingCount === 0) {
        console.log(`✓ [${locale}/${ns}] Fully synchronized (0 keys missing).`);
        continue;
      }

      console.log(`Translating ${missingCount} missing keys for [${locale}/${ns}]...`);
      try {
        const translatedBatch = await translateBatchWithBackoff(missingKeys, locale);
        const mergedFlat = { ...targetFlat, ...translatedBatch };
        const finalNested = unflatten(mergedFlat);

        // Safe write: atomic write using UTF-8 without BOM
        fs.writeFileSync(targetFilePath, JSON.stringify(finalNested, null, 2), 'utf8');
        console.log(`\x1b[32m%s\x1b[0m`, `✓ [${locale}/${ns}] Synced successfully.`);
      } catch (error) {
        console.error(`\x1b[31m%s\x1b[0m`, `✗ [${locale}/${ns}] Failed to sync: ${error.message}`);
      }
    }
  }
}

runLocalizationSync();