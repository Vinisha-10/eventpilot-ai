import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EventPilot AI — AI-Powered Event Management",
  description: "Plan, organize, and manage events with AI assistance. From weddings to conferences, EventPilot AI helps you create unforgettable experiences.",
  keywords: "event management, AI planner, wedding planning, conference management, event organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-grid bg-gradient-radial min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
