import { useLocation } from "wouter";
import { LayoutDashboard, Mic, History, Search, Settings } from "lucide-react";

export default function MobileNav() {
  const [location, navigate] = useLocation();
  
  const isActive = (path: string) => location === path;
  
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex justify-around">
        <a 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          className={`flex flex-col items-center py-2 px-3 ${isActive("/") ? "text-primary-600" : "text-gray-500"}`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-xs mt-1">Dashboard</span>
        </a>
        <a 
          href="/new-meeting" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/new-meeting");
          }}
          className={`flex flex-col items-center py-2 px-3 ${isActive("/new-meeting") ? "text-primary-600" : "text-gray-500"}`}
        >
          <Mic className="h-5 w-5" />
          <span className="text-xs mt-1">New Meeting</span>
        </a>
        <a 
          href="/history" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/history");
          }}
          className={`flex flex-col items-center py-2 px-3 ${isActive("/history") ? "text-primary-600" : "text-gray-500"}`}
        >
          <History className="h-5 w-5" />
          <span className="text-xs mt-1">History</span>
        </a>
        <a 
          href="/search" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/search");
          }}
          className={`flex flex-col items-center py-2 px-3 ${isActive("/search") ? "text-primary-600" : "text-gray-500"}`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </a>
        <a 
          href="/settings" 
          onClick={(e) => {
            e.preventDefault();
            navigate("/settings");
          }}
          className={`flex flex-col items-center py-2 px-3 ${isActive("/settings") ? "text-primary-600" : "text-gray-500"}`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xs mt-1">Settings</span>
        </a>
      </div>
    </div>
  );
}
