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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <LayoutWithSidebar>{children}</LayoutWithSidebar>
        </div>
      </body>
    </html>
  );
}
