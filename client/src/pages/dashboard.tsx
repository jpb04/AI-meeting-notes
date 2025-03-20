import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsCard from "@/components/dashboard/stats-card";
import MeetingCard from "@/components/dashboard/meeting-card";
import NoteCard from "@/components/dashboard/note-card";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Meeting, MeetingNote } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Get statistics
  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalMeetings: number;
    hoursSaved: number;
    actionItems: number;
    storageUsed: string;
  }>({
    queryKey: ["/api/stats"],
  });

  // Get upcoming meetings
  const { data: upcomingMeetings, isLoading: upcomingMeetingsLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings/upcoming"],
  });

  // Get recent meetings
  const { data: recentMeetings, isLoading: recentMeetingsLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings/recent"],
  });

  // Get recently accessed notes
  const { data: recentNotes, isLoading: recentNotesLoading } = useQuery<MeetingNote[]>({
    queryKey: ["/api/notes/recent"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.username}! View your recent meetings and summaries.</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                className="shadow-sm font-medium"
                onClick={() => navigate("/new-meeting")}
              >
                <PlusIcon className="mr-1.5 h-4 w-4" /> New Meeting
              </Button>
            </div>
          </div>
          
          {/* Meeting Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard 
              title="Total Meetings"
              value={stats?.totalMeetings.toString() || "0"}
              icon="calendar-check"
              color="blue"
            />
            <StatsCard 
              title="Hours Saved"
              value={stats?.hoursSaved.toString() || "0"}
              icon="time"
              color="green"
            />
            <StatsCard 
              title="Action Items"
              value={stats?.actionItems.toString() || "0"}
              icon="task"
              color="purple"
            />
            <StatsCard 
              title="Storage Used"
              value={stats?.storageUsed || "0 GB"}
              icon="hard-drive"
              color="amber"
            />
          </div>
          
          {/* Upcoming & Recent Meetings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Meetings */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Upcoming Meetings</h2>
                <a href="#" className="text-sm text-primary hover:text-primary/90 font-medium">View All</a>
              </div>
              <div className="divide-y divide-gray-200">
                {upcomingMeetingsLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                ) : upcomingMeetings && upcomingMeetings.length > 0 ? (
                  upcomingMeetings.map((meeting) => (
                    <MeetingCard 
                      key={meeting.id}
                      meeting={meeting}
                      type="upcoming"
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No upcoming meetings</div>
                )}
              </div>
            </div>
            
            {/* Recent Meeting Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Recent Meeting Notes</h2>
                <a href="#" className="text-sm text-primary hover:text-primary/90 font-medium">View All</a>
              </div>
              <div className="divide-y divide-gray-200">
                {recentMeetingsLoading ? (
                  <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                ) : recentMeetings && recentMeetings.length > 0 ? (
                  recentMeetings.map((meeting) => (
                    <MeetingCard 
                      key={meeting.id}
                      meeting={meeting}
                      type="recent"
                    />
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-gray-500">No recent meetings</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Recently Accessed Notes */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recently Accessed Notes</h2>
              <a href="#" className="text-sm text-primary hover:text-primary/90 font-medium">View All</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {recentNotesLoading ? (
                <div className="col-span-full text-center text-sm text-gray-500 py-8">Loading...</div>
              ) : recentNotes && recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))
              ) : (
                <div className="col-span-full text-center text-sm text-gray-500 py-8">No recent notes found</div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
