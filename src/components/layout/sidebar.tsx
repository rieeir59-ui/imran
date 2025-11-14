'use client';

import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Building2, Home, Hotel, Landmark, BriefcaseBusiness, LayoutDashboard, FolderKanban, ClipboardCheck, GanttChart, Building } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/commercial', icon: Building, label: 'Commercial Projects' },
  { href: '/residential', icon: Home, label: 'Residential' },
  { href: '/hotel', icon: Hotel, label: 'Hotel' },
  { href: '/bank', icon: Landmark, label: 'Bank Branches' },
  { href: '/projects', icon: FolderKanban, label: 'Project Information' },
  { href: '/predesign-assessment', icon: ClipboardCheck, label: 'Predesign Assessment' },
  { href: '/project-timeline', icon: GanttChart, label: 'Project Timeline' },
  { href: '/bank-alfalah-timeline', icon: Landmark, label: 'Bank Alfalah Timeline' },
  { href: '/ubl-timeline', icon: Landmark, label: 'UBL Timeline' },
  { href: '/bank-al-habib-timeline', icon: Landmark, label: 'Bank Al Habib Timeline' },
  { href: '/hbl-timeline', icon: Landmark, label: 'HBL Timeline' },
  { href: '/dib-timeline', icon: Landmark, label: 'DIB Timeline' },
  { href: '/fbl-timeline', icon: Landmark, label: 'FBL Timeline' },
  { href: '/mcb-timeline', icon: Landmark, label: 'MCB Timeline' },
  { href: '/cbd-timeline', icon: Landmark, label: 'CBD Timeline' },
  { href: '/askari-bank-timeline', icon: Landmark, label: 'Askari Bank Timeline' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  
  return (
    <Sidebar className="no-print">
      <SidebarHeader>
        <a href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="size-8 text-sidebar-primary" />
          {state === 'expanded' && <h1 className="text-xl font-semibold">Isbah Dashboard</h1>}
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton href={item.href} tooltip={item.label} isActive={pathname === item.href}>
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
