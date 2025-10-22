import type { Metadata } from "next";
// @ts-ignore: Ignore missing type declarations for CSS side-effect import
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
        <main className="px-4 md:px-6 lg:px-14">{children}</main>
      </body>
    </html>
  );
}
