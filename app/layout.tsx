import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Nexus ID", description: "Tap into the event." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
