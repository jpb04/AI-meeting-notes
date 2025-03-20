import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/ui/user-avatar";
import { MessageSquareText, LayoutDashboard, Mic, History, Search, Settings, HelpCircle, LogOut } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
}

function NavItem({ icon, label, href, isActive }: NavItemProps) {
  const [_, navigate] = useLocation();
  
  return (
    <a 
      href={href} 
      className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg ${
        isActive 
          ? "bg-primary-100 text-primary-700" 
          : "text-gray-700 hover:bg-gray-100"
      }`}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {icon}
      {label}
    </a>
  );
}

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 transition-all duration-300 bg-white border-r border-gray-200 shadow-sm">
      {/* Logo and App Name */}
      <div className="flex items-center px-6 py-4 h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
            <MessageSquareText className="h-6 w-6" />
          </span>
          <span className="text-lg font-semibold text-primary-700">AI Meeting Notes</span>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex flex-col flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <NavItem 
            icon={<LayoutDashboard className="mr-3 h-5 w-5" />} 
            label="Dashboard" 
            href="/" 
            isActive={location === "/"} 
          />
          <NavItem 
            icon={<Mic className="mr-3 h-5 w-5" />} 
            label="New Meeting" 
            href="/new-meeting" 
            isActive={location === "/new-meeting"} 
          />
          <NavItem 
            icon={<History className="mr-3 h-5 w-5" />} 
            label="Meeting History" 
            href="/history" 
            isActive={location === "/history"} 
          />
          <NavItem 
            icon={<Search className="mr-3 h-5 w-5" />} 
            label="Search" 
            href="/search" 
            isActive={location === "/search"} 
          />
          <NavItem 
            icon={<Settings className="mr-3 h-5 w-5" />} 
            label="Settings" 
            href="/settings" 
            isActive={location === "/settings"} 
          />
          <NavItem 
            icon={<HelpCircle className="mr-3 h-5 w-5" />} 
            label="Help & Support" 
            href="/help" 
            isActive={location === "/help"} 
          />
        </div>
      </nav>
      
      {/* User Profile Section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <UserAvatar name={user?.username || ""} className="mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email || "User"}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
