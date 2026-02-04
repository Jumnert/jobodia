import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import {
  SignedOut as ClerkSignedOut,
  SignedIn as ClerkSignedIn,
} from "@clerk/nextjs";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import React, { Children, ReactNode, Suspense } from "react";

export const SignedOut = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <ClerkSignedOut>{children}</ClerkSignedOut>
    </Suspense>
  );
};

export const SignedIn = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense>
      <ClerkSignedIn>{children}</ClerkSignedIn>
    </Suspense>
  );
};
