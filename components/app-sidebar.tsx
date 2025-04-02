'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
const items = [
  {
    title: 'Twenty-somethings',
    url: '#',
    emoji: '👨‍🎓',
  },
  {
    title: 'Technology',
    url: '#',
    emoji: '💻',
  },
  {
    title: 'Sports',
    url: '#',
    emoji: '🏃‍♂️',
  },
  {
    title: 'Politics',
    url: '#',
    emoji: '🗳️',
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <a href="/">
                    <span>🏠</span>
                    <span className={cn(pathname === '/' && 'font-semibold')}>
                      Home
                    </span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Rooms</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <span>{item.emoji}</span>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="text-center">
        <p className="text-xs text-muted-foreground">
          Brought to you by{' '}
          <a
            href="https://www.justobii.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-blue-500"
          >
            justobii.com
          </a>
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
