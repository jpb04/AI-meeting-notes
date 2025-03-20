import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserAvatar from "@/components/ui/user-avatar";
import { BellIcon, MenuIcon, SearchIcon } from "lucide-react";

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  
  const toggleSidebar = () => {
    // This would need a more complex implementation to actually toggle a mobile sidebar
    setSidebarOpen(!sidebarOpen);
    
    // Find sidebar element and toggle it
    const sidebar = document.querySelector('aside');
    if (sidebar) {
      sidebar.classList.toggle('hidden');
      sidebar.classList.toggle('fixed');
      sidebar.classList.toggle('inset-0');
      sidebar.classList.toggle('z-50');
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm h-16 flex items-center px-4 lg:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden mr-2" onClick={toggleSidebar}>
        <MenuIcon className="h-5 w-5 text-gray-500" />
      </Button>
      
      {/* Mobile Logo */}
      <div className="flex lg:hidden items-center">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 18.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
            <path d="M15.5 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
            <path d="M8.5 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"></path>
            <path d="M6.5 14.5A3.5 3.5 0 0 0 10 18"></path>
            <path d="M14 5a3.5 3.5 0 0 0 1.5 2.9"></path>
            <path d="M8.5 5c.3.6.8 1.1 1.5 1.5"></path>
          </svg>
        </span>
        <span className="ml-2 text-base font-semibold text-primary-700">AI Meeting Notes</span>
      </div>
      
      {/* Search */}
      <div className="flex-1 flex items-center justify-end">
        <div className="hidden md:flex md:w-80 2xl:w-96 relative">
          <Input
            type="text"
            placeholder="Search meeting notes..."
            className="w-full pr-10"
          />
          <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full">
            <SearchIcon className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        
        {/* Notification Bell */}
        <Button variant="ghost" size="icon" className="ml-3 relative">
          <BellIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
        
        {/* User Profile (Mobile) */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden ml-1"
          onClick={() => navigate("/settings")}
        >
          <UserAvatar name={user?.username || ""} className="h-8 w-8" />
        </Button>
      </div>
    </header>
  );
}
