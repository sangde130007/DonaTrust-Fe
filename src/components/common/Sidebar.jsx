import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, Users, Calendar, Settings, User, BarChart3, FileText } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';

// Menu items for DonaTrust application
const items = [
  {
    title: 'Trang chủ',
    url: '/',
    icon: Home,
  },
  {
    title: 'Quản lý người dùng',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Chiến dịch',
    url: '/campaigns',
    icon: Heart,
  },
  {
    title: 'Chiến dịch chờ duyệt',
    url: '/charity-pending',
    icon: FileText,
  },
  {
    title: 'Hồ sơ',
    url: '/profile',
    icon: User,
  },
  {
    title: 'Quản lý tin tức',
    url: '/admin/news',
    icon: FileText,
  },
    {
    title: 'Duyệt tổ chức từ thiện',
    url: '/admin/charities/pending',
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar>
      <SidebarContent>
        {/* Logo Section */}
        {/* <div className="flex justify-center items-center p-4 mb-8">
          <img
            src="/images/img_top.png"
            alt="DonaTrust Logo"
            className="object-contain w-32 h-auto"
          />
        </div> */}

        <SidebarGroup>
          <SidebarGroupLabel>Điều hướng chính</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={
                        isActive ? 'text-blue-700 bg-blue-50 border-r-2 border-blue-700' : ''
                      }
                    >
                      <Link to={item.url} className="flex items-center space-x-3">
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
