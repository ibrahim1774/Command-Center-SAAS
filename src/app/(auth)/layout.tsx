export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ backgroundColor: "#f8f7f4" }}
      className="min-h-screen flex items-center justify-center px-4 py-12"
    >
      {children}
    </div>
  );
}
