'use client'
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, Inbox, Search } from "lucide-react"
import Link from "next/link";
import { NavUser } from "./User_nav_bar";
import useCurrentUser from "@/hooks/useCurrentUser";

const MenuItems =[
  {
    title:'Home',
    url:'/dashboard/poster',
    icon:Home,

  },
  {
    title:'Inbox',
    url:'#',
    icon:Inbox,

  },
  {
    title:'Search',
    url:'#',
    icon:Search,

  },
]


export default function PosterDashboardSidebar() {
  const user = useCurrentUser();

  
  return (
    <Sidebar variant="sidebar">

      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup >
          <SidebarGroupLabel>poster</SidebarGroupLabel>
          <SidebarGroupContent>

            <SidebarMenu>
            {MenuItems.map((item)=>(
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                  <item.icon/>
                  <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            </SidebarMenu>
          
          </SidebarGroupContent>

        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter >
        <NavUser email={user?.email} name={user?.name} image={user?.image} role={user?.role}/>
      </SidebarFooter>
    </Sidebar>
  );
}
