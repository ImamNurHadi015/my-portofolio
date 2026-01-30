import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Imam Nurhadi | Mobile & Website Development",
  description:
    "Portfolio personal Imam Nurhadi - Developer Mobile dan Website. Hi, I am Imam Nurhadi.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
