import { useState, useEffect, useRef, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { useToast } from './use-toast';

interface UseAudioRecorderProps {
  onTranscriptionReceived?: (transcription: {
    text: string;
    speaker: string;
    timestamp: string;
  }) => void;
}

export function useAudioRecorder({
  onTranscriptionReceived,
}: UseAudioRecorderProps = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  // Handle transcription received from WebSocket
  const handleMessage = useCallback((data: any) => {
    if (data.type === 'transcription' && onTranscriptionReceived) {
      onTranscriptionReceived({
        text: data.text,
        speaker: data.speaker,
        timestamp: data.timestamp,
      });
    }
  }, [onTranscriptionReceived]);

  // Set up WebSocket connection
  const { status: socketStatus, sendMessage } = useWebSocket({
    onMessage: handleMessage,
    onOpen: () => console.log('WebSocket connected - ready for audio recording'),
    onError: () => {
      toast({
        title: 'Connection Error',
        description: 'Could not connect to the transcription service. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Start recording function
  const startRecording = useCallback(async (speakerName = 'You') => {
    try {
      // Reset recording chunks
      recordingChunksRef.current = [];

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up recorder event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
          
          // Convert the audio chunk to base64
          const reader = new FileReader();
          reader.readAsDataURL(event.data);
          reader.onloadend = () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            
            if (base64Audio && socketStatus === 'open') {
              // Send audio chunk to server
              sendMessage({
                type: 'audio',
                audio: base64Audio,
                speaker: speakerName,
              });
            }
          };
        }
      };

      // Start recording
      mediaRecorder.start(2000); // Collect data every 2 seconds
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check your browser permissions.',
        variant: 'destructive',
      });
    }
  }, [socketStatus, sendMessage, toast]);

  // Pause recording function
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  // Resume recording function
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    }
  }, [isRecording, isPaused]);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      // Stop timer
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Stop all audio tracks
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getAudioTracks().forEach(track => track.stop());
      }
    };
  }, [isRecording]);

  // Format timer display (MM:SS)
  const formattedTime = useCallback(() => {
    const minutes = Math.floor(recordingTime / 60);
    const seconds = recordingTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [recordingTime]);

  return {
    isRecording,
    isPaused,
    recordingTime,
    formattedTime: formattedTime(),
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    isSocketConnected: socketStatus === 'open',
  };
}