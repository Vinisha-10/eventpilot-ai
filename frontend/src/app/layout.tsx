import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Eventra AI — AI-Powered Event Management",
  description: "Plan, organize, and manage events with AI assistance. From weddings to conferences, Eventra AI helps you create unforgettable experiences.",
  keywords: "event management, AI planner, wedding planning, conference management, event organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-grid bg-gradient-radial min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#ffffff',
                color: '#2e171b',
                border: '1px solid #e8d0d4',
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
