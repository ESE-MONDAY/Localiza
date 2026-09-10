import type { AppProps } from 'next/app';
import '@/app/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  if (!Component) return null;
  return <Component {...pageProps} />;
}