import { AppSideBar } from "@/components/sidebar/AppSideBar";
import SideBarNavMenuGroup from "@/components/sidebar/SideBarNavMenuGroup";
import { SidebarUserButton } from "@/features/users/components/sidebarUserButton";
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  DollarSignIcon,
  LayoutDashboard,
  LogInIcon,
  PrinterCheckIcon,
} from "lucide-react";
import { ReactNode } from "react";

export default function JobSeekerLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: ReactNode;
}) {
  return (
    <AppSideBar
      content={
        <>
          {sidebar}
          <SideBarNavMenuGroup
            className="mt-auto"
            items={[
              { href: "/", icon: <ClipboardListIcon />, label: "Job Board" },
              {
                href: "/ai-search",
                icon: <BrainCircuitIcon />,
                label: "Ai Search",
              },
              {
                href: "/employer/pricing",
                icon: <DollarSignIcon />,
                label: "Pricing",
              },
              {
                href: "/employer",
                icon: <LayoutDashboard />,
                label: "Employer Dashboard",
                authStatus: "signedIn",
              },
              {
                href: "/sign-in",
                icon: <LogInIcon />,
                label: "Sign In",
                authStatus: "signedOut",
              },
            ]}
          />
        </>
      }
      footerButton={<SidebarUserButton />}
    >
      {children}
    </AppSideBar>
  );
}
