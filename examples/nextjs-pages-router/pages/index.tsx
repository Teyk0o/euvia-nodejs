export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Euvia Analytics Demo</h1>
        <p className="text-xl mb-8">
          GDPR-compliant real-time analytics for Next.js (Pages Router)
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="/admin"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Admin Dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
