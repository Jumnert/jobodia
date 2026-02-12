"use client";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";
import { ReactNode, Suspense } from "react";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export function ClerkProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ClerkProviderContent>{children}</ClerkProviderContent>
    </Suspense>
  );
}

function ClerkProviderContent({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  return (
    <OriginalClerkProvider
      appearance={{
        baseTheme: resolvedTheme === "dark" ? dark : undefined,
      }}
    >
      {children}
    </OriginalClerkProvider>
  );
}
