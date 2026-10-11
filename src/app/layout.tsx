import type { Metadata } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { AppHeader } from "@/components/shell/AppHeader";

export const metadata: Metadata = {
  title: "LostLens — AI-Powered Lost & Found Platform",
  description:
    "Intelligent lost-and-found recovery platform powered by Amazon Rekognition visual labels and deterministic multi-attribute matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50/50 font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
        <div className="min-h-full flex flex-col">
          {/* Desktop Sidebar */}
          <AppSidebar />

          {/* Main content wrapper */}
          <div className="md:pl-64 flex flex-col flex-1">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
