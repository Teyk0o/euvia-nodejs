import { EuviaTracker } from '@euvia/live';
import type { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />

      {/* Add Euvia tracker */}
      <EuviaTracker
        serverUrl={process.env.NEXT_PUBLIC_EUVIA_URL || 'ws://localhost:3001'}
        heartbeatInterval={60000}
        enabled={true}
      />
    </>
  );
}
