"use client";
import { Sheet } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function ClientSheet({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // Only render on mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(false);
          router.push(`/?${searchParams.toString()}`);
        }
      }}
      modal
    >
      {children}
    </Sheet>
  );
}
