export default function DashboardLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen w-full">
        <main className="mx-auto w-full max-w-6xl py-8">{children}</main>
      </div>
    );
  }
  
  
  