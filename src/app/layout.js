import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export const metadata = {
  title: "Feedback Collection System",
  description: "Efficiently track and manage team feedback collection efforts.",
};

import { AuthModalProvider } from "@/context/AuthModalContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
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
        </ConvexClientProvider>
      </body>
    </html>
  );
}
