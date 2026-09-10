import Document, { Html, Head, Main, NextScript } from 'next/document';

export default function CustomDocument() {
  return (
    <Html lang="en">
      <Head />
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}