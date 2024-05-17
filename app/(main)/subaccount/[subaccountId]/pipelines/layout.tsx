export default function PipelinesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full h-screen overflow-y-scroll">{children}</div>;
}
