export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex h-screen w-screen items-center justify-center">
      {children}
    </section>
  );
}
