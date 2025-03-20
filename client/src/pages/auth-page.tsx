import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquareText, Loader2 } from "lucide-react";

const loginSchema = insertUserSchema.extend({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Redirect if user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center mb-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-white">
                <MessageSquareText className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">AI Meeting Notes</CardTitle>
            <CardDescription>Sign in to your account or create a new one</CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mx-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <CardContent className="p-6">
              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing In
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="Choose a username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Create a password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm your password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Account
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2 text-center text-sm text-gray-500 px-6">
              <p>
                {activeTab === "login" 
                  ? "Don't have an account?" 
                  : "Already have an account?"
                }
                <Button 
                  variant="link" 
                  className="pl-1 pr-0 h-auto text-primary" 
                  onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                >
                  {activeTab === "login" ? "Sign up" : "Sign in"}
                </Button>
              </p>
            </CardFooter>
          </Tabs>
        </Card>
      </div>
      
      {/* Hero Section */}
      <div className="flex-1 hidden lg:flex bg-gradient-to-br from-primary/90 to-primary/70 text-white">
        <div className="max-w-md mx-auto flex flex-col justify-center p-12">
          <h1 className="text-3xl font-bold mb-6">
            Your AI-Powered Meeting Assistant
          </h1>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <MessageSquareText className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Real-Time Transcription</h3>
                <p className="mt-1 text-white/80">Get accurate, real-time transcription of your meetings</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-brain">
                  <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5V20a5 5 0 0 0-10 0V9.5A2.5 2.5 0 0 1 4.5 7" />
                  <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5V20a5 5 0 0 1 10 0V9.5A2.5 2.5 0 0 0 19.5 7" />
                  <path d="M12 4.5C12 5.88 13.12 7 14.5 7H18a2 2 0 0 1 2 2v7.5" />
                  <path d="M12 4.5C12 5.88 10.88 7 9.5 7H6a2 2 0 0 0-2 2v7.5" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">AI-Powered Summaries</h3>
                <p className="mt-1 text-white/80">Automatically extract key points, decisions, and action items</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-video">
                  <path d="M12.83 2H17c1.1 0 2 .9 2 2v7c0 1.1-.9 2-2 2h-8c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h4.83" />
                  <path d="m15 10 5 5v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2l5-5" />
                  <path d="M15 10v0a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v0" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold">Zoom & Google Meet Integration</h3>
                <p className="mt-1 text-white/80">Works seamlessly with your favorite meeting platforms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
