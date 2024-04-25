import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";
import Nav from "./_components/navigation/Nav";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <div className="h-full">
        <Nav />

        {children}
      </div>
    </ClerkProvider>
  );
}
