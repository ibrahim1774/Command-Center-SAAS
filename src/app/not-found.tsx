import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-7xl font-bold text-accent-primary mb-4">404</h1>
        <h2 className="font-display text-2xl text-text-primary mb-3">Page not found</h2>
        <p className="text-sm text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-2.5 bg-accent-primary text-white text-sm font-medium rounded-full hover:bg-accent-primary/90 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
