import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "STEM",
  description: "Career Test web app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-blueprimary">
        <Nav />
        <main className="px-14">{children}</main>
      </body>
    </html>
  );
}
