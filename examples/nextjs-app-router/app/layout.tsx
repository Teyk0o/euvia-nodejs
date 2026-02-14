import { EuviaTracker } from '@euvia/live';
import './globals.css';

export const metadata = {
  title: 'My App with Euvia',
  description: 'Next.js app with GDPR-compliant analytics',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* Add Euvia tracker - invisible, GDPR-compliant */}
        <EuviaTracker
          serverUrl={process.env.NEXT_PUBLIC_EUVIA_URL || 'ws://localhost:3001'}
          heartbeatInterval={60000}
          enabled={true}
        />
      </body>
    </html>
  );
}
