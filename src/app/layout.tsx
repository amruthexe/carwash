import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import NotificationToast from "@/components/NotificationToast";
import { auth } from "@/auth";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "PureWash | Community Car Cleaning",
  description: "Schedule your car cleaning easily inside your gated community.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${poppins.variable} font-sans antialiased`}
      >
        {children}
        <Toaster 
          position="top-center" 
          expand={true} 
          richColors 
          theme="light"
          toastOptions={{
            style: { 
              marginTop: '40px',
            },
          }}
        />
        {session?.user && <NotificationToast />}
      </body>
    </html>
  );
}
