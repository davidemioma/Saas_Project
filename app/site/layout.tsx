import Nav from "./_components/navigation/Nav";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <Nav />

      {children}
    </div>
  );
}
