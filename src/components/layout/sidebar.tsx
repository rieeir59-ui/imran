
'use client';

import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { BriefcaseBusiness, LayoutDashboard, FolderKanban, ClipboardCheck, GanttChart, Building, Home, Hotel, Landmark, ScrollText, Cog, CalendarClock, Users, Save, FilePlus, FileText } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const mainMenuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/settings', icon: Cog, label: 'Settings' },
];

const projectFormsItems = [
  { href: '/projects', icon: FolderKanban, label: 'Project Information' },
  { href: '/predesign-assessment', icon: ClipboardCheck, label: 'Predesign Assessment' },
  { href: '/project-timeline', icon: GanttChart, label: 'Project Timeline' },
  { href: '/bank', icon: ScrollText, label: 'Bank Forms' },
  { href: '/weekly-schedule', icon: CalendarClock, label: 'Work Schedule' },
  { href: '/schedules-by-designation', icon: Users, label: 'Schedules by Designation' },
  { href: '/save-record', icon: Save, label: 'Saved Records' },
  { href: '/assign-task', icon: FilePlus, label: 'Assign Task' },
  { href: '/bill-of-quantity', icon: FileText, label: 'Bill Of Quantity'},
  { href: '/requirement-performa', icon: FileText, label: 'Requirement Performa' },
];

const timelineItems = [
  { href: '/commercial-timeline', icon: Building, label: 'Commercial' },
  { href: '/residential-timeline', icon: Home, label: 'Residential' },
  { href: '/askari-bank-timeline', icon: Landmark, label: 'Askari Bank' },
  { href: '/bank-alfalah-timeline', icon: Landmark, label: 'Bank Alfalah' },
  { href: '/bank-al-habib-timeline', icon: Landmark, label: 'Bank Al Habib' },
  { href: '/cbd-timeline', icon: Landmark, label: 'CBD' },
  { href: '/dib-timeline', icon: Landmark, label: 'DIB' },
  { href: '/fbl-timeline', icon: Landmark, label: 'FBL' },
  { href: '/hbl-timeline', icon: Landmark, label: 'HBL' },
  { href: '/mcb-timeline', icon: Landmark, label: 'MCB' },
  { href: '/ubl-timeline', icon: Landmark, label: 'UBL' },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  
  const renderMenuItems = (items: typeof mainMenuItems) => {
    return items.map((item) => (
      <SidebarMenuItem key={item.href}>
        <SidebarMenuButton href={item.href} tooltip={item.label} isActive={pathname === item.href}>
          <item.icon />
          <span>{item.label}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

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
          {renderMenuItems(mainMenuItems)}
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupLabel>Project Forms</SidebarGroupLabel>
          <SidebarMenu>
            {renderMenuItems(projectFormsItems)}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Timelines</SidebarGroupLabel>
          <SidebarMenu>
            {renderMenuItems(timelineItems)}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
