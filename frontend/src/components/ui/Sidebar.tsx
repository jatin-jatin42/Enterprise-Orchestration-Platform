import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

import {
  LayoutDashboard,
  Users,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  User,  
  Wrench
} from 'lucide-react';
import { GraduationCap, Briefcase } from 'lucide-react';

interface SidebarProps {
  isMobileOpen?: boolean;
  setIsMobileOpen?: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen: externalIsMobileOpen,
  setIsMobileOpen: externalSetIsMobileOpen
}) => {
  const location = useLocation();
  const { logout, user } = useAuthStore();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    { 
      name: 'Interns', 
      href: '/dashboard/interns', 
      icon: Users,
      description: 'Manage internship program'
    },
    { 
      name: 'Projects', 
      href: '/dashboard/projects', 
      icon: Briefcase,
      description: 'Track and manage company projects'
    },
    { 
      name: 'Learning Resources', 
      href: '/dashboard/learning', 
      icon: GraduationCap,
      description: 'Access and manage all learning materials.'
    },
    {
      name: "Tools & Tech",
      href: "/dashboard/toolstech",
      icon: Wrench,
      description: "Tools and technologies"
    }
  ];

  const [isOpen, setIsOpen] = useState(true);

  const isMobileOpen = externalIsMobileOpen ?? false;
  const setIsMobileOpen = externalSetIsMobileOpen ?? (() => {});

  const isActive = (path: string) => location.pathname === path;

  // Auto close sidebar on mobile route change
  useEffect(() => {
    if (externalSetIsMobileOpen) {
      externalSetIsMobileOpen(false);
    }
  }, [location.pathname, externalSetIsMobileOpen]);

  const sidebarContent = (
    <>
      {/* Header Section */}
      <div className="flex flex-col border-b border-gray-700 bg-gray-800">
        <div className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} h-16 px-4`}>
          {/* Logo placeholder when expanded - for spacing consistency */}
          {isOpen && <div className="w-6" />}
          
          {/* Desktop Toggle Button - Always visible on desktop */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
          >
            {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Mobile Close Button - Only on mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Invisible spacer when collapsed to maintain center alignment */}
          {!isOpen && <div className="hidden lg:block w-6" />}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center group relative rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gray-700 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  } ${isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'}`}
                >
                  <Icon 
                    size={20} 
                    className={`shrink-0 ${isActive(item.href) ? "text-white" : "text-gray-400"}`}
                  />
                  {isOpen && (
                    <div className="flex-1 min-w-0 ml-3">
                      <span className="text-sm font-medium block">{item.name}</span>
                      <span className="text-xs text-gray-400 mt-0.5 block">{item.description}</span>
                    </div>
                  )}
                  
                  {/* Tooltip for collapsed state */}
                  {!isOpen && (
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-300 mt-0.5">{item.description}</div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Profile & Logout */}
      <div className="border-t border-gray-700 bg-gray-800">
        {/* User Profile */}
        <div className={`p-4 ${isOpen ? 'space-y-4' : 'space-y-3'}`}>
          {/* User Info */}
          <div className={`flex items-center group relative ${
            isOpen ? 'space-x-3' : 'justify-center'
          }`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 bg-linear-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></div>
            </div>
            
            {isOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username || 'Admin User'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.email || 'admin@company.com'}
                </p>
                <p className="text-xs text-blue-400 mt-0.5 capitalize">
                  {user?.role || 'Admin'}
                </p>
              </div>
            )}
            
            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                <div className="font-medium">{user?.username || 'Admin User'}</div>
                <div className="text-xs text-gray-300">{user?.email || 'admin@company.com'}</div>
                <div className="text-xs text-blue-400 mt-0.5 capitalize">
                  {user?.role || 'Admin'}
                </div>
              </div>
            )}
          </div>

          {/* Spacer for logout button */}
          <div className="px-2 my-5">
            {/* Logout Button */}
            <button
              onClick={logout}
              className={`flex items-center w-full group relative rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white ${
                isOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'
              }`}
            >
              <LogOut size={20} className="shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium ml-3">Logout</span>
              )}
              
              {/* Tooltip for collapsed state */}
              {!isOpen && (
                <div className="absolute left-full ml-3 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-gray-700">
                  Logout
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/70 bg-opacity-90 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative z-40 h-[calc(100vh-64px)] bg-gray-800 shadow-2xl border-r border-gray-700 transition-all duration-300 ease-in-out
        ${isOpen ? 'w-72' : 'w-20'}
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
