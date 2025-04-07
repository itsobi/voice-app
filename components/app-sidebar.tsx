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
  useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { ChevronUp } from 'lucide-react';
import { User2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { SignedIn, useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
const items = [
  {
    title: 'Twenty-somethings',
    url: '/twenty-somethings',
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
  const { isMobile, toggleSidebar } = useSidebar();
  const user = useUser();
  return (
    <Sidebar>
      <SidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link
                    href={'/'}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    <span className="text-lg">🏠</span>
                    <span
                      className={cn(
                        'text-xs text-muted-foreground',
                        pathname === '/' && 'font-semibold text-primary'
                      )}
                    >
                      Home
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Topics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link
                      href={'/twenty-somethings'}
                      onClick={isMobile ? toggleSidebar : undefined}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span
                        className={cn(
                          'text-xs text-muted-foreground',
                          pathname === `${item.url}` &&
                            'font-semibold text-black'
                        )}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge>24</SidebarMenuBadge>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SignedIn>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="mb-8">
                  <SidebarMenuButton>
                    <Avatar>
                      <AvatarImage src={user?.user?.imageUrl} />
                      <AvatarFallback>
                        {user.user?.firstName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs">@{user?.user?.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.user?.emailAddresses[0].emailAddress}
                      </span>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem className="cursor-pointer">
                    <span>💪 Upgrade to Pro</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    <span>👋 Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SignedIn>

        <div className="text-center text-xs font-extralight">
          <p className="text-muted-foreground">
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
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
