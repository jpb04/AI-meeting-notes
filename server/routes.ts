import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { summarizeMeeting, transcribeAudio } from "./openai";
import { z } from "zod";
import { insertMeetingSchema } from "@shared/schema";

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);

  // Create WebSocket server for real-time transcription
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');

    ws.on('message', async (message) => {
      try {
        // Handle incoming audio data for transcription
        const data = JSON.parse(message.toString());
        
        if (data.type === 'audio') {
          // Process audio with OpenAI Whisper
          const transcription = await transcribeAudio(data.audio);
          
          // Send transcription back to client
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: 'transcription',
              text: transcription,
              speaker: data.speaker || 'Unknown',
              timestamp: new Date().toISOString()
            }));
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // API Routes
  // Get user stats
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get upcoming meetings
  app.get("/api/meetings/upcoming", isAuthenticated, async (req, res) => {
    try {
      const meetings = await storage.getUpcomingMeetings(req.user!.id);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming meetings" });
    }
  });

  // Get recent meetings
  app.get("/api/meetings/recent", isAuthenticated, async (req, res) => {
    try {
      const meetings = await storage.getRecentMeetings(req.user!.id);
      res.json(meetings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent meetings" });
    }
  });

  // Get recent notes
  app.get("/api/notes/recent", isAuthenticated, async (req, res) => {
    try {
      const notes = await storage.getRecentNotes(req.user!.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent notes" });
    }
  });

  // Get meeting by ID
  app.get("/api/meetings/:id", isAuthenticated, async (req, res) => {
    try {
      const meeting = await storage.getMeeting(parseInt(req.params.id));
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch meeting" });
    }
  });

  // Get meeting transcript
  app.get("/api/meetings/:id/transcript", isAuthenticated, async (req, res) => {
    try {
      const transcript = await storage.getMeetingTranscript(parseInt(req.params.id));
      res.json(transcript);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transcript" });
    }
  });

  // Create new meeting
  app.post("/api/meetings", isAuthenticated, async (req, res) => {
    try {
      const meetingData = {
        ...req.body,
        userId: req.user!.id
      };
      
      // Calculate endTime based on startTime and duration
      const startTime = req.body.time;
      const durationMinutes = parseInt(req.body.duration);
      
      // Convert startTime to Date object to calculate endTime
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      
      const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
      const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
      
      // Create the meeting
      const meeting = await storage.createMeeting({
        userId: req.user!.id,
        title: req.body.title,
        platform: req.body.platform,
        meetingUrl: req.body.meetingUrl,
        date: req.body.date,
        startTime: startTime,
        endTime: endTime,
        duration: durationMinutes,
        description: req.body.description || "",
      });
      
      res.status(201).json(meeting);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  // Start recording a meeting
  app.post("/api/meetings/record", isAuthenticated, async (req, res) => {
    try {
      // For MVP, just return success
      // In a real app, this would start the recording process
      res.status(200).json({ success: true, message: "Recording started" });
    } catch (error) {
      res.status(500).json({ message: "Failed to start recording" });
    }
  });

  // Summarize a meeting
  app.post("/api/meetings/:id/summarize", isAuthenticated, async (req, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      const meeting = await storage.getMeeting(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ message: "Meeting not found" });
      }
      
      const transcript = await storage.getMeetingTranscript(meetingId);
      
      if (!transcript || transcript.length === 0) {
        return res.status(400).json({ message: "No transcript found for this meeting" });
      }
      
      // Get full text from transcript
      const fullText = transcript.map(entry => `${entry.speaker}: ${entry.text}`).join('\n');
      
      // Summarize with OpenAI
      const summary = await summarizeMeeting(fullText);
      
      // Create meeting note
      const note = await storage.createMeetingNote({
        meetingId: meetingId,
        userId: req.user!.id,
        title: meeting.title,
        summary: summary.summary,
        keyTopics: summary.keyTopics,
        actionItems: summary.actionItems,
        decisions: summary.decisions,
        date: meeting.date,
      });
      
      res.status(201).json(note);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to summarize meeting" });
    }
  });

  return httpServer;
}
