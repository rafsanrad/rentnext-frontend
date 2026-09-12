export default function PaymentCancelPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
        <div className="mb-4 text-5xl">❌</div>

        <h1 className="mb-3 text-2xl font-bold text-white">
          Payment Cancelled
        </h1>

        <p className="mb-6 text-slate-400">
          Your payment was cancelled. No payment was completed.
        </p>

        <a
          href="/tenant-dashboard"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          Back to Dashboard
        </a>
      </div>
    </main>
  );
}