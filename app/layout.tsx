import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { UserProvider } from "./context/UserContext";
import { CardProvider } from "./context/CardContext";

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Notouchness - Dijital NFC Kartvizit",
  description: "Profesyonel kimliğinizi dijital dünyada etkileyici bir şekilde sunun",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${poppins.variable} antialiased font-sans`}>
        <CardProvider>
          <UserProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </UserProvider>
        </CardProvider>
      </body>
    </html>
  );
}
