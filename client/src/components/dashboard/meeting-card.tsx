import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, Users, Video, CalendarDays, ChevronRight, FileText } from "lucide-react";
import { Meeting } from "@shared/schema";

type MeetingCardProps = {
  meeting: Meeting;
  type: "upcoming" | "recent";
};

export default function MeetingCard({ meeting, type }: MeetingCardProps) {
  const [_, navigate] = useLocation();
  
  const handleClick = () => {
    if (type === "upcoming") {
      // Join the meeting
      window.open(meeting.meetingUrl, "_blank");
    } else {
      // View meeting details
      navigate(`/meeting/${meeting.id}`);
    }
  };
  
  const getPlatformIcon = () => {
    switch (meeting.platform) {
      case "zoom":
        return (
          <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1329.08 1329.08" className="h-6 w-6">
              <path fill="currentColor" d="M664.54 0c367.02 0 664.54 297.52 664.54 664.54s-297.52 664.54-664.54 664.54S0 1031.56 0 664.54 297.52 0 664.54 0z" />
              <path fill="#fff" d="M664.54 75.36c325.17 0 589.18 264.01 589.18 589.18s-264.01 589.18-589.18 589.18S75.36 989.71 75.36 664.54 339.37 75.36 664.54 75.36zm249.56 437.89c0-15.36-5.12-25.6-15.36-35.84-10.24-10.24-20.48-15.36-35.84-15.36h-398.74c-15.36 0-25.6 5.12-35.84 15.36-10.24 10.24-15.36 20.48-15.36 35.84v258.33c0 15.36 5.12 25.6 15.36 35.84 10.24 10.24 20.48 15.36 35.84 15.36h398.74c15.36 0 25.6-5.12 35.84-15.36 10.24-10.24 15.36-20.48 15.36-35.84V513.25zm-270.04 80.47V716.8c0 8.62-10.47 13.67-17.82 8.62L496.6 654.23c-2.56-1.86-4.04-4.8-4.04-7.94v-57.6c0-8.62 10.47-13.67 17.82-8.62l129.64 71.19c2.56 1.86 4.04 4.8 4.04 7.94zm99.84-80.47l-93.87 51.2c-2.56 1.28-5.5 1.28-8.06 0l-93.87-51.2c-7.34-3.68-7.34-14.15 0-17.82l93.87-51.2c2.56-1.28 5.5-1.28 8.06 0l93.87 51.2c7.34 3.68 7.34 14.15 0 17.82z"/>
            </svg>
          </span>
        );
      case "google-meet":
        return (
          <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 79.96" className="h-6 w-6">
              <path fill="currentColor" d="M47.59,37.59V16.84c0-9.28,7.54-16.79,16.86-16.79,9.33,0,16.88,7.51,16.88,16.79V37.59l-33.74,0ZM10.38,79.91V41.96l16.96,0V16.84c0-9.29,7.55-16.8,16.88-16.8V10.3h0c-3.59,0-6.52,2.91-6.52,6.53V41.96l23.25,0V31.28l33.74,0v10.66l15.03,0V79.9H10.38ZM109.72,41.94h6.37a6.8,6.8,0,0,0,6.79-6.79V10.56c0-0.57-.24-2.46-1.63-2.94a2.48,2.48,0,0,0-2.61.7c-1.31,1.31-1.2,3-.93,4.28V18a2.9,2.9,0,0,1-2.9,2.9H109.7a6.8,6.8,0,0,0-6.79,6.79V34.5a6.81,6.81,0,0,0,6.8,7.44h0Z" />
            </svg>
          </span>
        );
      case "microsoft-teams":
        return (
          <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2228.833 2073.333" className="h-6 w-6">
              <path fill="currentColor" d="M1554.637,777.5h575.713c54.391,0,98.483,44.092,98.483,98.483c0,10.465,0,20.93,0,20.93	c0,42.508-1.907,104.299-34.337,142.458c-19.023,22.837-44.092,34.337-73.414,34.337h-564.214	c-8.558,41.555-15.209,83.11-24.279,125.458c18.07,2.093,36.151,3.767,54.232,5.022c84.251,6.046,164.061,12.251,244.389,24.209	c117.144,17.325,182.344,99.47,182.344,217.007v203.716c0,175.21-72.295,204.68-291.248,204.68h-1c-147.214,0-242.32-19.058-262.249-150.279c-10.453-66.649-5.232-113.376-4.186-150.279c0.466-19.023,0.896-34.81-1.628-47.232	c-6.697-32.93-35.326-43.43-98.017-43.43h-261.75c-47.358,0-46.462-39.488-41.555-64.6c6.651-40.651,37.139-55.32,111.413-87.784	c88.344-40.558,171.014-59.207,172.944-59.672l2.093-0.489l-0.478-2.093c-0.547-2.396-54.882-246.279-86.764-350.158	c-56.974-185.04-203.6-211.323-381.95-211.323H422.878c10.465,34.337,43.895,42.971,76.786,42.971h120.771	c58.881,0,81.879,42.971,95.436,88.344c55.67,181.367,94.249,334.11,101.832,414.88c-35.791,7.035-173.433,42.04-232.825,100.921	c-68.647,67.153-73.554,131.844-66.986,173.399c12.581,79.276,83.529,126.446,181.367,126.446h307.667	c169.339,0,223.274,30.744,237.295,106.016c5.348,28.837,4.093,59.16,2.907,87.437c-1.535,40.674-3.245,82.163,7.5,120.807	c38.14,136.314,164.586,158.14,360.04,158.14h1c187.067,0,328.387-19.058,328.387-243.818v-210.323	c0-165.63-94.856-253.961-257.944-275.713c-81.181-10.965-167.247-17.558-249.922-23.721	c-32.325-2.396-64.649-4.651-96.974-7.5c1.593-9.303,2.791-18.605,3.954-27.86c9.838-73.414,19.023-142.968,38.983-214.124h124.039	c90.971,0,174.524-31.628,219.063-78.972c56.367-61.033,58.893-141.961,58.893-190.856c0-105.458-86.392-191.344-191.879-191.344	h-597.62c9.35,32.93,36.744,49.789,74.93,49.789h488.779c45.533,0,82.856,36.616,82.856,82.53	c0,60.707-6.232,109.993-37.672,143.782c-25.674,27.674-61.312,31.442-90.971,31.442h-112.54	c21.86-69.135,29.767-150.767,8.558-223.414c-47.93-162.9-213.609-162.9-312.574-162.9H350.642L1554.637,777.5z M957.617,612.5	H601.229H555.7c-69.135,0-126.446-28.86-126.446-108.14c0-79.251,57.311-108.14,126.446-108.14h45.528h202.846	c93.11,0,174.99,32.325,174.99,108.14C978.53,580.17,896.65,612.5,957.617,612.5z" />
            </svg>
          </span>
        );
      default:
        return (
          <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600">
            <Video className="h-6 w-6" />
          </span>
        );
    }
  };
  
  return (
    <div className="p-4 hover:bg-gray-50 transition duration-150">
      <div className="flex justify-between">
        <div className="flex items-start">
          {getPlatformIcon()}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">{meeting.title}</h3>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              {type === "upcoming" ? (
                <>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short' })}, {meeting.startTime} - {meeting.endTime}</span>
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    <span>{meeting.participants.length} participants</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    <span>{new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </span>
                  <span className="mx-2">•</span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{meeting.duration} minutes</span>
                  </span>
                </>
              )}
            </div>
            {type === "recent" && meeting.actionItems && (
              <div className="mt-2">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  {meeting.actionItems.length} Action Items
                </div>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                  <FileText className="h-3 w-3 mr-1" />
                  Summary
                </div>
              </div>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:text-primary/80 font-medium text-sm h-6 px-2"
          onClick={handleClick}
        >
          {type === "upcoming" ? "Join" : "View"}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
