import { users, type User, type InsertUser, meetings, type Meeting, type InsertMeeting, meetingNotes, type MeetingNote, type InsertMeetingNote, meetingTranscripts, type MeetingTranscript, type InsertMeetingTranscript } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getUpcomingMeetings(userId: number): Promise<Meeting[]>;
  getRecentMeetings(userId: number): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  
  // Meeting Notes operations
  getMeetingNote(id: number): Promise<MeetingNote | undefined>;
  getRecentNotes(userId: number): Promise<MeetingNote[]>;
  createMeetingNote(note: InsertMeetingNote): Promise<MeetingNote>;
  
  // Meeting Transcript operations
  getMeetingTranscript(meetingId: number): Promise<MeetingTranscript[]>;
  addTranscriptEntry(entry: InsertMeetingTranscript): Promise<MeetingTranscript>;
  
  // Stats operations
  getUserStats(userId: number): Promise<{
    totalMeetings: number;
    hoursSaved: number;
    actionItems: number;
    storageUsed: string;
  }>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private meetings: Map<number, Meeting>;
  private meetingNotes: Map<number, MeetingNote>;
  private meetingTranscripts: Map<number, MeetingTranscript[]>;
  private userIdCounter: number;
  private meetingIdCounter: number;
  private noteIdCounter: number;
  private transcriptIdCounter: number;
  public sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.meetings = new Map();
    this.meetingNotes = new Map();
    this.meetingTranscripts = new Map();
    this.userIdCounter = 1;
    this.meetingIdCounter = 1;
    this.noteIdCounter = 1;
    this.transcriptIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
    });
    
    // Add some initial data for demonstration
    this.seedData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    // Add participants (in a real implementation, this would come from the meetingParticipants table)
    const participants = ["Alex Johnson", "Maria Garcia", "James Wilson", "Sarah Lee", "David Kim"];
    
    return {
      ...meeting,
      participants,
      keyTopics: ["Project scope", "Timeline review", "Resource allocation", "Next steps"],
      actionItems: [
        { task: "Create project timeline document", assignee: "Maria Garcia", dueDate: "2023-09-30" },
        { task: "Set up development environment", assignee: "James Wilson", dueDate: "2023-09-25" },
        { task: "Draft initial user stories", assignee: "Sarah Lee", dueDate: "2023-09-27" },
      ],
      decisions: [
        "Approved 12-week timeline for initial release",
        "Selected React Native for mobile development",
        "Weekly status updates scheduled for Mondays"
      ]
    };
  }

  async getUpcomingMeetings(userId: number): Promise<Meeting[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.meetings.values())
      .filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meeting.userId === userId && meetingDate >= today && meeting.status === 'scheduled';
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 3)
      .map(meeting => ({
        ...meeting,
        participants: ["Alex Johnson", "Maria Garcia", "James Wilson", "Sarah Lee", "David Kim"].slice(0, 2 + Math.floor(Math.random() * 4)),
      }));
  }

  async getRecentMeetings(userId: number): Promise<Meeting[]> {
    const today = new Date();
    
    return Array.from(this.meetings.values())
      .filter(meeting => {
        const meetingDate = new Date(meeting.date);
        return meeting.userId === userId && meetingDate <= today && meeting.status === 'completed';
      })
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Reverse sort - newest first
      })
      .slice(0, 3)
      .map(meeting => ({
        ...meeting,
        participants: ["Alex Johnson", "Maria Garcia", "James Wilson", "Sarah Lee", "David Kim"].slice(0, 2 + Math.floor(Math.random() * 4)),
        actionItems: [
          { task: "Follow up on action items", assignee: "Alex Johnson", dueDate: "2023-09-30" },
          { task: "Share meeting notes with team", assignee: "Maria Garcia", dueDate: "2023-09-25" },
        ]
      }));
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const id = this.meetingIdCounter++;
    const createdAt = new Date();
    const meeting: Meeting = {
      ...meetingData,
      id,
      status: 'scheduled',
      createdAt,
      participants: []
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  // Meeting Notes operations
  async getMeetingNote(id: number): Promise<MeetingNote | undefined> {
    return this.meetingNotes.get(id);
  }

  async getRecentNotes(userId: number): Promise<MeetingNote[]> {
    return Array.from(this.meetingNotes.values())
      .filter(note => {
        const meeting = this.meetings.get(note.meetingId);
        return meeting && meeting.userId === userId;
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt);
        const dateB = new Date(b.updatedAt);
        return dateB.getTime() - dateA.getTime(); // Newest first
      })
      .slice(0, 6)
      .map(note => ({
        ...note,
        actionItemCount: Array.isArray(note.actionItems) ? note.actionItems.length : 0
      }));
  }

  async createMeetingNote(noteData: InsertMeetingNote): Promise<MeetingNote> {
    const id = this.noteIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const note: MeetingNote = {
      ...noteData,
      id,
      createdAt,
      updatedAt,
      actionItemCount: Array.isArray(noteData.actionItems) ? noteData.actionItems.length : 0
    };
    this.meetingNotes.set(id, note);
    return note;
  }

  // Meeting Transcript operations
  async getMeetingTranscript(meetingId: number): Promise<MeetingTranscript[]> {
    return this.meetingTranscripts.get(meetingId) || [];
  }

  async addTranscriptEntry(entry: InsertMeetingTranscript): Promise<MeetingTranscript> {
    const id = this.transcriptIdCounter++;
    const createdAt = new Date();
    const transcriptEntry: MeetingTranscript = {
      ...entry,
      id,
      createdAt
    };
    
    const existingTranscripts = this.meetingTranscripts.get(entry.meetingId) || [];
    existingTranscripts.push(transcriptEntry);
    this.meetingTranscripts.set(entry.meetingId, existingTranscripts);
    
    return transcriptEntry;
  }

  // Stats operations
  async getUserStats(userId: number): Promise<{
    totalMeetings: number;
    hoursSaved: number;
    actionItems: number;
    storageUsed: string;
  }> {
    // Count user's meetings
    const userMeetings = Array.from(this.meetings.values()).filter(
      meeting => meeting.userId === userId
    );
    
    // Count total action items across all meetings
    let totalActionItems = 0;
    userMeetings.forEach(meeting => {
      if (meeting.actionItems) {
        totalActionItems += meeting.actionItems.length;
      }
    });
    
    // Calculate hours saved (assume 1 hour saved per completed meeting)
    const completedMeetings = userMeetings.filter(meeting => meeting.status === 'completed');
    const hoursSaved = completedMeetings.length * 0.5; // Assuming each meeting saves 30 minutes
    
    // Calculate storage used (just a mock calculation)
    const transcriptCount = Array.from(this.meetingTranscripts.keys()).filter(
      meetingId => userMeetings.some(meeting => meeting.id === meetingId)
    ).length;
    
    // Assume each transcript uses about 100 KB
    const storageUsedMB = (transcriptCount * 0.1).toFixed(1);
    
    return {
      totalMeetings: userMeetings.length,
      hoursSaved,
      actionItems: totalActionItems,
      storageUsed: `${storageUsedMB} GB`
    };
  }

  // Seed data for demonstration purposes
  private seedData() {
    // Create sample meeting data
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    // Sample transcript entries
    const sampleTranscript = [
      {
        meetingId: 4,
        speaker: "Maria Garcia",
        text: "Good morning everyone! Thanks for joining our project kickoff meeting. Today we'll be discussing the scope, timeline, and team assignments for our new mobile app development project.",
        timestamp: "10:03 AM",
        startTime: 180,
        endTime: 195,
        createdAt: new Date(),
        id: this.transcriptIdCounter++
      },
      {
        meetingId: 4,
        speaker: "Alex Johnson",
        text: "Thanks Maria. I've prepared a preliminary timeline for us to review. Based on our initial estimates, I think we're looking at a 12-week development cycle to get to our MVP.",
        timestamp: "10:05 AM",
        startTime: 300,
        endTime: 315,
        createdAt: new Date(),
        id: this.transcriptIdCounter++
      },
      {
        meetingId: 4,
        speaker: "James Wilson",
        text: "From a technical perspective, I'd recommend we use React Native for the mobile app. It'll allow us to maintain a single codebase for both iOS and Android, which should help us meet that 12-week timeline.",
        timestamp: "10:08 AM",
        startTime: 480,
        endTime: 495,
        createdAt: new Date(),
        id: this.transcriptIdCounter++
      },
      {
        meetingId: 4,
        speaker: "Sarah Lee",
        text: "I agree with James on React Native. For user stories, I'll need input from everyone about their respective modules. Can I get those by the end of this week?",
        timestamp: "10:12 AM",
        startTime: 720,
        endTime: 735,
        createdAt: new Date(),
        id: this.transcriptIdCounter++
      },
      {
        meetingId: 4,
        speaker: "David Kim",
        text: "From a budget perspective, I'll need to allocate resources appropriately. React Native seems cost-effective since we won't need separate iOS and Android teams. I'll draft a resource allocation plan by next week.",
        timestamp: "10:15 AM",
        startTime: 900,
        endTime: 915,
        createdAt: new Date(),
        id: this.transcriptIdCounter++
      }
    ] as MeetingTranscript[];
    
    this.meetingTranscripts.set(4, sampleTranscript);
  }
}

export const storage = new MemStorage();
