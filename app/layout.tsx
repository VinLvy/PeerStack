import type { Metadata } from "next";
import "./globals.css";
import { DemoStoreProvider } from "@/components/demo-store-provider";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "PeerStack | Socratic Java Peer-Mentoring Prototype",
  description:
    "Interactive frontend prototype for STACK 2026 Semifinal: Agentic Socratic Peer-Mentoring for Introductory Programming Courses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DemoStoreProvider>
          <AppShell>{children}</AppShell>
        </DemoStoreProvider>
      </body>
    </html>
  );
}
