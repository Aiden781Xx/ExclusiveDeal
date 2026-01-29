import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConversAllab - Startup Benefits Platform",
  description: "Access startup benefits and deals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
