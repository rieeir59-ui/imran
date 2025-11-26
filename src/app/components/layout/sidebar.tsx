'use client';
import { useState, useEffect } from 'react';
import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInput,
} from "@/components/ui/sidebar";
import { BriefcaseBusiness, LayoutDashboard, FolderKanban, ClipboardCheck, GanttChart, Building, Home, Hotel, Landmark, ScrollText, Cog, CalendarClock, Users, Save, FilePlus, FileText, Database, Image, LayoutList, MessageSquare, BookUser, LocateFixed, Folder, UserCheck, DollarSign, FileEdit } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';

const mainMenuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/settings', icon: Cog, label: 'Settings' },
];

const projectFormsItems = [
  { href: '/projects', icon: FolderKanban, label: 'Project Information' },
  { href: '/predesign-assessment', icon: ClipboardCheck, label: 'Predesign Assessment' },
  { href: '/project-checklist', icon: ClipboardCheck, label: 'Project Checklist' },
  { href: '/project-data', icon: Database, label: 'Project Data' },
  { href: '/project-agreement', icon: FileText, label: 'Project Agreement' },
  { href: '/list-of-services', icon: ScrollText, label: 'List of Services' },
  { href: '/site-survey', icon: FileText, label: 'Site Survey' },
  { href: '/site-visit', icon: LocateFixed, label: 'Site Visit Form' },
  { href: '/proposal-request', icon: FileText, label: 'Proposal Request' },
  { href: '/drawings', icon: Image, label: 'List of Drawings' },
  { href: '/shop-drawings-record', icon: LayoutList, label: 'Shop Drawings Record' },
  { href: '/project-timeline', icon: GanttChart, label: 'Project Timeline' },
  { href: '/bank', icon: ScrollText, label: 'Bank Forms' },
  { href: '/weekly-schedule', icon: CalendarClock, label: 'Work Schedule' },
  { href: '/schedules-by-designation', icon: Users, label: 'Schedules by Designation' },
  { href: '/save-record', icon: Save, label: 'Saved Records' },
  { href: '/assign-task', icon: FilePlus, label: 'Assign Task' },
  { href: '/bill-of-quantity', icon: FileText, label: 'Bill Of Quantity'},
  { href: '/requirement-performa', icon: FileText, label: 'Requirement Performa' },
  { href: '/field-report', icon: BookUser, label: 'Field Report' },
  { href: '/transmittal-letter', icon: MessageSquare, label: 'Transmittal Letter' },
  { href: '/minutes-of-meeting', icon: ClipboardCheck, label: 'Minutes of Meeting' },
  { href: '/file-manager', icon: Folder, label: 'File Manager' },
  { href: '/sub-consultant-list', icon: UserCheck, label: 'Sub-consultant List' },
  { href: '/contractor-list', icon: Users, label: 'List of Contractors' },
  { href: '/project-application-summary', icon: FileText, label: 'Project Application Summary' },
  { href: '/preliminary-project-budget', icon: DollarSign, label: 'Preliminary Project Budget' },
  { href: '/rate-analysis', icon: DollarSign, label: 'Rate Analysis' },
  { href: '/change-order', icon: FileEdit, label: 'Change Order' },
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
  const { state, isMobile } = useSidebar();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
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
  
  const SidebarContentHolder = () => (
    <>
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
    </>
  );

  return (
    <Sidebar className="no-print">
      <SidebarHeader>
        <a href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="size-8 text-sidebar-primary" />
          {isClient && (state === 'expanded' || isMobile) && <h1 className="text-xl font-semibold gradient-text">Isbah Dashboard</h1>}
        </a>
        <SidebarInput placeholder="Search..." />
      </SidebarHeader>
      <SidebarContent>
        {isClient ? <SidebarContentHolder /> : null}
      </SidebarContent>
    </Sidebar>
  );
}
