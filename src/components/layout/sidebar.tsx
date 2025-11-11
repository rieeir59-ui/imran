'use client';

import { 
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { Building2, Home, Hotel, Landmark, BriefcaseBusiness } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="size-8 text-sidebar-primary" />
          {state === 'expanded' && <h1 className="text-xl font-semibold">Isbah Dashboard</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Commercial" isActive={false}>
              <Building2 />
              <span>Commercial</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Residential" isActive={false}>
              <Home />
              <span>Residential</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Hotel" isActive={false}>
              <Hotel />
              <span>Hotel</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Bank Branches" isActive={false}>
              <Landmark />
              <span>Bank Branches</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
