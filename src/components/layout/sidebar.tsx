'use client';

import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Building2, Home, Hotel, Landmark, BriefcaseBusiness, LayoutDashboard, FolderKanban, ClipboardCheck, GanttChart } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/commercial', icon: Building2, label: 'Commercial' },
  { href: '/residential', icon: Home, label: 'Residential' },
  { href: '/hotel', icon: Hotel, label: 'Hotel' },
  { href: '/bank', icon: Landmark, label: 'Bank Branches' },
  { href: '/projects', icon: FolderKanban, label: 'Project Information' },
  { href: '/predesign-assessment', icon: ClipboardCheck, label: 'Predesign Assessment' },
  { href: '/project-timeline', icon: GanttChart, label: 'Project Timeline' },
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
