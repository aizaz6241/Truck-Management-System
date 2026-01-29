import type { Metadata } from "next";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import { LoadingProvider } from "@/components/LoadingProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-english" });
// Check if Noto Nastaliq Urdu is available, otherwise allow fallback.
// Using "Arial" as fallback in globals.css, but trying to load google font.
// Note: Noto_Nastaliq_Urdu might need specific subset or weight.
const urduFont = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-urdu",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Truck Trip Management System",
  description: "Secure and scalable management system for truck trips.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${urduFont.variable}`}
        suppressHydrationWarning
      >
        <LanguageProvider>
          <LoadingProvider>{children}</LoadingProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
