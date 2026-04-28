import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

export const metadata = {
  title: "Feedback Collection System",
  description: "Efficiently track and manage team feedback collection efforts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexClientProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <footer className="py-8 border-t border-slate-100 bg-white">
              <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} FeedbackTracker. All rights reserved.
              </div>
            </footer>
          </div>
          <Toaster position="top-center" richColors />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
