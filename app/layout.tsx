import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@mdxeditor/editor/style.css";
import { ClerkProvider } from "@/services/clerk/componenets/ClerkProvider";
import { Toaster } from "@/components/ui/sonner";
import { UploadThingSSR } from "@/services/uploadThing/components/uploadThingSSR";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { OrganizationSyncer } from "@/features/organizations/components/OrganizationSyncer";
import { UserSyncer } from "@/features/users/components/UserSyncer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
        >
          <UserSyncer />
          <OrganizationSyncer />
          {children}
          <Toaster />
          <UploadThingSSR />
        </body>
      </html>
    </ClerkProvider>
  );
}
