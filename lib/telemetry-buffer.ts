import { TelemetryPayload } from './types';

class TelemetryClient {
  private queue: TelemetryPayload[] = [];
  private isFlushScheduled = false;
  private endpoint = '/api/telemetry';
  private maxBatchSize = 10;
  private maxWaitMs = 3000;
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Flush remaining events when user backgrounds or closes tab
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flushNowSync();
        }
      });

      window.addEventListener('pagehide', () => {
        this.flushNowSync();
      });
    }
  }

  public track(event: Omit<TelemetryPayload, 'eventId' | 'timestamp'>) {
    const fullEvent: TelemetryPayload = {
      ...event,
      eventId: `evt_${crypto.randomUUID()}`,
      timestamp: Date.now(),
    };

    this.queue.push(fullEvent);

    if (this.queue.length >= this.maxBatchSize) {
      this.scheduleFlush(0);
    } else {
      this.scheduleFlush(this.maxWaitMs);
    }
  }

  private scheduleFlush(delay: number) {
    if (this.isFlushScheduled && delay > 0) return;

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    this.isFlushScheduled = true;

    this.flushTimer = setTimeout(() => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(() => this.flushNow());
      } else {
        this.flushNow();
      }
    }, delay);
  }

  private async flushNow(): Promise<void> {
    this.isFlushScheduled = false;
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];

    try {
      const body = JSON.stringify({ events: batch });
      await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    } catch {
      // Prepend failed batch back to queue to prevent event loss
      this.queue = [...batch, ...this.queue];
    }
  }

  private flushNowSync(): void {
    if (this.queue.length === 0) return;

    const batch = [...this.queue];
    this.queue = [];
    const payload = JSON.stringify({ events: batch });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const delivered = navigator.sendBeacon(this.endpoint, blob);
      if (delivered) return;
    }

    // Fallback if sendBeacon fails or is blocked
    fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

export const telemetry = new TelemetryClient();