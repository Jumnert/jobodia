import SideBarNavMenuGroup from "@/components/sidebar/SideBarNavMenuGroup";
import { BellIcon, FileIcon } from "lucide-react";

export function UserSettingSidebar() {
  return (
    <SideBarNavMenuGroup
      items={[
        {
          href: "/user-settings/notifications",
          icon: <BellIcon />,
          label: "Notifications",
        },
        {
          href: "/user-settings/resume",
          icon: <FileIcon />,
          label: "Resume",
        },
      ]}
    />
  );
}
