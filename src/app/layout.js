import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter" });
const notoDevanagari = Noto_Sans_Devanagari({ 
  subsets: ["devanagari", "latin"], 
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-noto-devanagari"
});

export const metadata = {
  title: "Feedback Collection System",
  description: "Efficiently track and manage team feedback collection efforts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${notoDevanagari.variable} font-sans`}>
        <ConvexClientProvider>
          <LanguageProvider>
            <AuthModalProvider>
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow">
                  {children}
                </main>
                <Footer />
              </div>
              <Toaster position="top-center" richColors />
            </AuthModalProvider>
          </LanguageProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
