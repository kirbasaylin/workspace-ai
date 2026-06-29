import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace AI",
  description: "An AI-native workspace that indexes your notes, documents and tasks.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
