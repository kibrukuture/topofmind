import type { Metadata } from "next";
import { fontVariables } from "@/theme/font-config";
import { cn } from "@/lib/ui/utils";
import QueryProvider from "@/components/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Top of Mind",
  description:
    "Top of Mind is a relationship memory assistant that captures raw notes about people you meet, uses AI agents to extract structured data, and surfaces everything about a person before your next meeting.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(fontVariables, "antialiased")}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
