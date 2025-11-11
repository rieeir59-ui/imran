'use client';

import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Building2, Home, Hotel, Landmark, BriefcaseBusiness, LayoutDashboard } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/commercial', icon: Building2, label: 'Commercial' },
  { href: '/residential', icon: Home, label: 'Residential' },
  { href: '/hotel', icon: Hotel, label: 'Hotel' },
  { href: '/bank', icon: Landmark, label: 'Bank Branches' },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const pathname = usePathname();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <BriefcaseBusiness className="size-8 text-sidebar-primary" />
          {state === 'expanded' && <h1 className="text-xl font-semibold">Isbah Dashboard</h1>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton as="a" tooltip={item.label} isActive={pathname === item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
