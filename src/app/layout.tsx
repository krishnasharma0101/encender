import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutWithSidebar from '@/components/LayoutWithSidebar';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Encender - Customized Gifting Made Easy",
  description: "Explore our unique selection of customized gifts delivered across India for every special occasion. Quality gifting with customer satisfaction.",
  keywords: "customized gifts, personalized gifts, gifting India, special occasions, handicrafts, custom designs",
  icons: {
    icon: '/encender.svg',
    shortcut: '/encender.svg',
    apple: '/encender.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
        </div>
      </body>
    </html>
  );
}
