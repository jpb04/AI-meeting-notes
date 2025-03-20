import { pgTable, text, serial, integer, boolean, date, time, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  platform: text("platform").notNull(), // zoom, google-meet, microsoft-teams
  meetingUrl: text("meeting_url"),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  duration: integer("duration").notNull(), // in minutes
  description: text("description"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingSchema = createInsertSchema(meetings).pick({
  userId: true,
  title: true,
  platform: true,
  meetingUrl: true,
  date: true,
  startTime: true,
  endTime: true,
  duration: true,
  description: true,
});

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect & {
  participants: string[];
  keyTopics?: string[];
  actionItems?: {
    task: string;
    assignee: string;
    dueDate: string;
  }[];
  decisions?: string[];
};

// Meeting Notes table
export const meetingNotes = pgTable("meeting_notes", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  keyTopics: jsonb("key_topics").notNull(),
  actionItems: jsonb("action_items").notNull(),
  decisions: jsonb("decisions").notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMeetingNoteSchema = createInsertSchema(meetingNotes).pick({
  meetingId: true,
  userId: true,
  title: true,
  summary: true,
  keyTopics: true,
  actionItems: true,
  decisions: true,
  date: true,
});

export type InsertMeetingNote = z.infer<typeof insertMeetingNoteSchema>;
export type MeetingNote = typeof meetingNotes.$inferSelect & {
  actionItemCount: number;
};

// Meeting Transcripts table
export const meetingTranscripts = pgTable("meeting_transcripts", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  speaker: text("speaker").notNull(),
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  startTime: integer("start_time").notNull(), // in seconds from start of meeting
  endTime: integer("end_time").notNull(), // in seconds from start of meeting
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingTranscriptSchema = createInsertSchema(meetingTranscripts).pick({
  meetingId: true,
  speaker: true,
  text: true,
  timestamp: true,
  startTime: true,
  endTime: true,
});

export type InsertMeetingTranscript = z.infer<typeof insertMeetingTranscriptSchema>;
export type MeetingTranscript = typeof meetingTranscripts.$inferSelect;

// Meeting Participants table
export const meetingParticipants = pgTable("meeting_participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id),
  name: text("name").notNull(),
  email: text("email"),
  isPresent: boolean("is_present").default(false),
  joinTime: timestamp("join_time"),
  leaveTime: timestamp("leave_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).pick({
  meetingId: true,
  name: true,
  email: true,
  isPresent: true,
  joinTime: true,
  leaveTime: true,
});

export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;
