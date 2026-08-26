import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Team Manager | Football Team Workspace",
    template: "%s | Team Manager",
  },
  description:
    "A football team-management workspace for rosters, availability, formation-aware lineups, and bench priority.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
