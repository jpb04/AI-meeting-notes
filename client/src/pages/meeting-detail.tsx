import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import UserAvatar from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Download, Share2, X, Edit, Copy } from "lucide-react";
import { Meeting, MeetingTranscript } from "@shared/schema";

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  
  // Get meeting details
  const { data: meeting, isLoading } = useQuery<Meeting>({
    queryKey: [`/api/meetings/${id}`],
  });
  
  // Get meeting transcript
  const { data: transcript, isLoading: transcriptLoading } = useQuery<MeetingTranscript[]>({
    queryKey: [`/api/meetings/${id}/transcript`],
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!meeting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6 max-w-md">
          <h2 className="text-lg font-semibold mb-2">Meeting Not Found</h2>
          <p className="text-gray-500 mb-4">The meeting you're looking for doesn't exist or you don't have access.</p>
          <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Meeting Detail View */}
          <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">{meeting.title}</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
              {/* Meeting Summary Section */}
              <div className="md:w-1/3 border-r border-gray-200 p-5 overflow-y-auto custom-scrollbar">
                <div>
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Meeting Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Date & Time</p>
                          <p className="text-sm text-gray-500">{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {meeting.startTime} - {meeting.endTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Participants</p>
                          <p className="text-sm text-gray-500">{meeting.participants.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 4h-5L7 7H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-3l-2.5-3Z"></path>
                          <circle cx="12" cy="13" r="3"></circle>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Platform</p>
                          <p className="text-sm text-gray-500">{meeting.platform}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mt-0.5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Duration</p>
                          <p className="text-sm text-gray-500">{meeting.duration} minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Key Topics */}
                  {meeting.keyTopics && meeting.keyTopics.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Key Topics</h3>
                      <ul className="space-y-2">
                        {meeting.keyTopics.map((topic, index) => (
                          <li key={index} className="flex items-start">
                            <span className="inline-flex items-center justify-center flex-shrink-0 w-5 h-5 mr-2 rounded-full bg-primary-100 text-primary-600 text-xs">
                              {index + 1}
                            </span>
                            <span className="text-sm text-gray-700">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Action Items */}
                  {meeting.actionItems && meeting.actionItems.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Action Items</h3>
                      <ul className="space-y-3">
                        {meeting.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 inline-flex items-center justify-center mr-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                              </svg>
                            </span>
                            <div>
                              <p className="text-sm font-medium text-gray-800">{item.task}</p>
                              <p className="text-xs text-gray-500">Assigned to: {item.assignee} • Due: {item.dueDate}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Decisions Made */}
                  {meeting.decisions && meeting.decisions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Decisions Made</h3>
                      <ul className="space-y-2">
                        {meeting.decisions.map((decision, index) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <span className="text-sm text-gray-700">{decision}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Full Transcript Section */}
              <div className="md:w-2/3 p-5 overflow-y-auto custom-scrollbar">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Full Transcript</h3>
                  
                  <div className="space-y-4">
                    {transcriptLoading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : transcript && transcript.length > 0 ? (
                      transcript.map((entry, index) => (
                        <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                          <div className="flex items-start mb-1.5">
                            <div className="flex-shrink-0 mr-3">
                              <UserAvatar name={entry.speaker} />
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="font-medium text-gray-900 text-sm">{entry.speaker}</span>
                                <span className="ml-2 text-xs text-gray-500">{entry.timestamp}</span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">
                                {entry.text}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No transcript available for this meeting.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Button variant="outline" className="bg-primary-50 border-primary-200 hover:bg-primary-100 hover:border-primary-300 text-primary-700">
                  <Edit className="mr-1.5 h-4 w-4" />
                  Edit Notes
                </Button>
                <Button variant="outline">
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div>
                <Button>
                  <Share2 className="mr-1.5 h-4 w-4" />
                  Share Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
