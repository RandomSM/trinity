import { ReactNode } from "react";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
import Providers from "./providers";
import "@styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body data-theme="light" suppressHydrationWarning>
        <Providers>
        <Navbar />
          <main className="container mx-auto p-4">{children}</main>
        <Footer />
        </Providers>
      </body>
    </html>
  );
}
