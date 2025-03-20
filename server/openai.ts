import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-development" });

/**
 * Transcribes audio data using OpenAI's Whisper model
 * @param audioBase64 Base64 encoded audio data
 * @returns Transcribed text
 */
export async function transcribeAudio(audioBase64: string): Promise<string> {
  try {
    // For development/demo purposes if no API key is provided
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-dummy-key-for-development") {
      console.log("No OpenAI API key provided. Returning mock transcription.");
      
      // Return a placeholder response
      return "This is a simulated transcription since no OpenAI API key was provided.";
    }

    // Convert base64 audio to buffer
    const audioBuffer = Buffer.from(audioBase64, 'base64');
    
    // Create a temporary file from the buffer
    const tempFilePath = `/tmp/audio-${Date.now()}.webm`;
    require('fs').writeFileSync(tempFilePath, audioBuffer);
    
    // Create a file stream for the API
    const fileStream = require('fs').createReadStream(tempFilePath);

    // Call the OpenAI API
    const transcription = await openai.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-1",
    });

    // Clean up the temporary file
    require('fs').unlinkSync(tempFilePath);

    return transcription.text;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw new Error(`Transcription failed: ${error.message}`);
  }
}

/**
 * Summarizes meeting transcription using OpenAI's GPT-4o model
 * @param transcript Full meeting transcript text
 * @returns Structured summary of the meeting
 */
export async function summarizeMeeting(transcript: string): Promise<{
  summary: string;
  keyTopics: string[];
  actionItems: { task: string; assignee: string; dueDate: string }[];
  decisions: string[];
}> {
  try {
    // For development/demo purposes if no API key is provided
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-dummy-key-for-development") {
      console.log("No OpenAI API key provided. Returning mock summary.");
      
      // Return a placeholder response with structure matching the expected format
      return {
        summary: "This is a simulated meeting summary as no OpenAI API key was provided.",
        keyTopics: ["Topic 1", "Topic 2", "Topic 3"],
        actionItems: [
          { task: "Mock action item 1", assignee: "Team Member 1", dueDate: "2023-09-30" },
          { task: "Mock action item 2", assignee: "Team Member 2", dueDate: "2023-10-05" }
        ],
        decisions: ["Mock decision 1", "Mock decision 2"]
      };
    }

    const prompt = `
      You are an AI meeting assistant that summarizes meeting transcripts.
      Please analyze the following meeting transcript and provide a structured summary.
      
      The summary should include:
      1. A concise overview of the meeting (2-3 sentences)
      2. Key topics discussed (as a list)
      3. Action items with assignees and due dates where mentioned (as a list)
      4. Decisions made during the meeting (as a list)
      
      Format your response as a JSON object with the following structure:
      {
        "summary": "text overview of the meeting",
        "keyTopics": ["topic 1", "topic 2", ...],
        "actionItems": [
          {"task": "description", "assignee": "person name", "dueDate": "YYYY-MM-DD"},
          ...
        ],
        "decisions": ["decision 1", "decision 2", ...]
      }
      
      Meeting Transcript:
      ${transcript}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      summary: result.summary,
      keyTopics: result.keyTopics,
      actionItems: result.actionItems,
      decisions: result.decisions
    };
  } catch (error) {
    console.error("Error in summarizeMeeting:", error);
    throw new Error(`Meeting summarization failed: ${error.message}`);
  }
}

/**
 * Extracts action items from meeting text using OpenAI
 * @param text Meeting text to analyze
 * @returns List of action items
 */
export async function extractActionItems(text: string): Promise<{ task: string; assignee: string; dueDate: string }[]> {
  try {
    // For development/demo purposes if no API key is provided
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-dummy-key-for-development") {
      console.log("No OpenAI API key provided. Returning mock action items.");
      
      // Return placeholder action items
      return [
        { task: "Mock action item 1", assignee: "Team Member 1", dueDate: "2023-09-30" },
        { task: "Mock action item 2", assignee: "Team Member 2", dueDate: "2023-10-05" }
      ];
    }

    const prompt = `
      You are an AI assistant that extracts action items from meeting texts.
      Please analyze the following text and identify all action items, the person assigned to each task, and any mentioned due dates.
      
      Format your response as a JSON array with the following structure:
      [
        {"task": "description of the task", "assignee": "person name", "dueDate": "YYYY-MM-DD"},
        ...
      ]
      
      If no due date is specified, use a reasonable future date. If no assignee is specified, leave it as "Unassigned".
      
      Text to analyze:
      ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error in extractActionItems:", error);
    throw new Error(`Action item extraction failed: ${error.message}`);
  }
}

/**
 * Analyzes sentiment of meeting based on transcript
 * @param transcript Meeting transcript to analyze
 * @returns Sentiment analysis result
 */
export async function analyzeMeetingSentiment(transcript: string): Promise<{
  overall: "positive" | "neutral" | "negative";
  score: number;
  highlights: { text: string; sentiment: "positive" | "neutral" | "negative" }[];
}> {
  try {
    // For development/demo purposes if no API key is provided
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-dummy-key-for-development") {
      console.log("No OpenAI API key provided. Returning mock sentiment analysis.");
      
      // Return placeholder sentiment analysis
      return {
        overall: "positive",
        score: 0.75,
        highlights: [
          { text: "This is a sample positive comment", sentiment: "positive" },
          { text: "This is a sample neutral comment", sentiment: "neutral" }
        ]
      };
    }

    const prompt = `
      You are an AI assistant that analyzes the sentiment of meeting transcripts.
      Please analyze the following meeting transcript and provide a sentiment analysis.
      
      Format your response as a JSON object with the following structure:
      {
        "overall": "positive" or "neutral" or "negative",
        "score": a number between -1 and 1, with -1 being very negative, 0 neutral, and 1 very positive,
        "highlights": [
          {"text": "excerpt from transcript showing sentiment", "sentiment": "positive" or "neutral" or "negative"},
          ...
        ]
      }
      
      Meeting Transcript:
      ${transcript}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Normalize score to be between 0 and 1 (UI friendly)
    const normalizedScore = (result.score + 1) / 2;
    
    return {
      overall: result.overall,
      score: normalizedScore,
      highlights: result.highlights
    };
  } catch (error) {
    console.error("Error in analyzeMeetingSentiment:", error);
    throw new Error(`Sentiment analysis failed: ${error.message}`);
  }
}
