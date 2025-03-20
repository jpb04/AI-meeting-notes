import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarDays, FileText, MoreVertical, ChevronRight } from "lucide-react";
import { MeetingNote } from "@shared/schema";

type NoteCardProps = {
  note: MeetingNote;
};

export default function NoteCard({ note }: NoteCardProps) {
  const [_, navigate] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleViewClick = () => {
    navigate(`/meeting/${note.meetingId}`);
  };

  const getIconColor = () => {
    const colors = ["blue", "amber", "purple", "green", "red"];
    return colors[note.id % colors.length];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-150 hover:border-primary-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className={`w-8 h-8 flex items-center justify-center rounded-md bg-${getIconColor()}-100 text-${getIconColor()}-600`}>
              <FileText className="h-4 w-4" />
            </span>
            <h3 className="ml-2 text-sm font-medium text-gray-900 truncate">{note.title}</h3>
          </div>
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewClick}>View Details</DropdownMenuItem>
              <DropdownMenuItem>Export PDF</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {note.summary}
        </p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mt-auto">
          <span className="flex items-center">
            <CalendarDays className="mr-1 h-3 w-3" />
            <span>{new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </span>
          {note.actionItemCount > 0 && (
            <div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {note.actionItemCount} Tasks
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
