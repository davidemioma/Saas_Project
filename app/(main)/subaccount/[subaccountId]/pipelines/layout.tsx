export default function PipelinesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="h-screen w-full">{children}</div>;
}
