import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CTF Platform | Capture The Flag",
  description: "Test your cybersecurity skills across forensics, web hacking, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="scanlines antialiased">{children}</body>
    </html>
  );
}
