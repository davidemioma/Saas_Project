import { dark } from "@clerk/themes";
import { ClerkProvider } from "@clerk/nextjs";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
  );
}
