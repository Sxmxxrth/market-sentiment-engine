import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Sentiment Engine",
  description: "Real-time AI Sentiment Analysis for Stocks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
