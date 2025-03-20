import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { Loader2, Mic, StopCircle, Pause, Play } from "lucide-react";

const meetingFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  platform: z.enum(["zoom", "google-meet", "microsoft-teams"]),
  meetingUrl: z.string().url("Please enter a valid URL"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  description: z.string().optional(),
  autoJoin: z.boolean().default(false),
  autoTranscribe: z.boolean().default(true),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

export default function NewMeeting() {
  const [transcriptions, setTranscriptions] = useState<{text: string; speaker: string; timestamp: string}[]>([]);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  const handleTranscriptionReceived = (transcription: {text: string; speaker: string; timestamp: string}) => {
    setTranscriptions(prev => [...prev, transcription]);
  };
  
  const {
    isRecording,
    isPaused,
    formattedTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    isSocketConnected
  } = useAudioRecorder({
    onTranscriptionReceived: handleTranscriptionReceived
  });
  
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      platform: "zoom",
      meetingUrl: "",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      duration: "60",
      description: "",
      autoJoin: false,
      autoTranscribe: true,
    },
  });
  
  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      const res = await apiRequest("POST", "/api/meetings", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings/upcoming"] });
      toast({
        title: "Meeting Created",
        description: "Your meeting has been scheduled successfully.",
      });
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create meeting. Please try again.",
      });
    },
  });
  
  const startRecordingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/meetings/record", {});
      return res.json();
    },
    onSuccess: () => {
      // Start actual microphone recording after API confirms
      startRecording();
      toast({
        title: "Recording Started",
        description: "AI is now transcribing your meeting in real-time.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start recording. Please try again.",
      });
    },
  });
  
  const onSubmit = (data: MeetingFormValues) => {
    createMeetingMutation.mutate(data);
  };
  
  const handleStartRecording = () => {
    // Make sure WebSocket is connected before starting
    if (!isSocketConnected) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the transcription service. Please refresh and try again.",
      });
      return;
    }
    
    if (!isRecording) {
      // Start recording through the API first
      startRecordingMutation.mutate();
    } else if (isPaused) {
      resumeRecording();
    } else {
      pauseRecording();
    }
  };
  
  const handleStopRecording = () => {
    stopRecording();
    // In a real app, we would save the transcriptions to the database here
    
    toast({
      title: "Recording Stopped",
      description: "Your recording has been stopped. Transcription is being processed.",
    });
  };
  
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Start a New Meeting</h1>
              <p className="text-sm text-gray-500">Schedule a meeting or start an instant recording session</p>
            </div>
            
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
              {/* Schedule Meeting Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Meeting</CardTitle>
                  <CardDescription>
                    Plan ahead by scheduling your meeting
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter meeting title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Platform</FormLabel>
                            <Select 
                              defaultValue={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select platform" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="zoom">Zoom</SelectItem>
                                <SelectItem value="google-meet">Google Meet</SelectItem>
                                <SelectItem value="microsoft-teams">Microsoft Teams</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="meetingUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meeting URL</FormLabel>
                            <FormControl>
                              <Input placeholder="Paste meeting link" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duration (minutes)</FormLabel>
                            <FormControl>
                              <Input type="number" min="5" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Add meeting agenda or notes"
                                className="resize-none"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="autoJoin"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Auto-join meeting
                              </FormLabel>
                              <FormDescription>
                                Automatically join the meeting at scheduled time
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="autoTranscribe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Auto-transcribe
                              </FormLabel>
                              <FormDescription>
                                Start transcription when meeting begins
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={createMeetingMutation.isPending}
                      >
                        {createMeetingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          "Schedule Meeting"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              {/* Start Instant Meeting Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Instant Recording</CardTitle>
                  <CardDescription>
                    Start transcribing your current meeting immediately
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-6 h-full">
                  <div className="text-center mb-8">
                    <div className={`mx-auto rounded-full p-10 ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-primary-50'} mb-4`}>
                      <Mic className={`h-20 w-20 ${isRecording ? 'text-red-500' : 'text-primary-500'}`} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      {isRecording ? "Recording in Progress" : "Start Recording"}
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                      {isRecording 
                        ? "AI is currently transcribing your meeting in real-time." 
                        : "Click the button below to start transcribing your current meeting instantly."}
                    </p>
                  </div>
                  
                  <div className="w-full space-y-3">
                    {isRecording && (
                      <div className="bg-gray-100 p-3 rounded-lg text-center mb-3">
                        <p className="text-sm font-medium">Recording Time: {formattedTime}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        className={`flex-1 ${isPaused ? 'bg-amber-500 hover:bg-amber-600' : isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
                        disabled={startRecordingMutation.isPending}
                        onClick={handleStartRecording}
                      >
                        {startRecordingMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                          </>
                        ) : !isRecording ? (
                          <>
                            <Mic className="mr-2 h-4 w-4" />
                            Start Recording
                          </>
                        ) : isPaused ? (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Resume
                          </>
                        ) : (
                          <>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause
                          </>
                        )}
                      </Button>
                      
                      {isRecording && (
                        <Button 
                          variant="outline" 
                          className="bg-white"
                          onClick={handleStopRecording}
                        >
                          <StopCircle className="mr-2 h-4 w-4" />
                          Stop
                        </Button>
                      )}
                    </div>
                    
                    {transcriptions.length > 0 && (
                      <div className="mt-4 border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                        <h4 className="text-sm font-semibold mb-2">Real-time Transcription</h4>
                        <div className="space-y-2">
                          {transcriptions.map((transcription, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{transcription.speaker}:</span> {transcription.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
