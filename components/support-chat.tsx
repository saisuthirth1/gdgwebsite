"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { Paperclip, Send, Video, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Message {
  id: number
  content: string
  sender: "user" | "support"
  timestamp: Date
}

interface SupportChatProps {
  isOpen: boolean
  onClose: () => void
}

export function SupportChat({ isOpen, onClose }: SupportChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "नमस्ते! I'm your Voter Technical Agent. How can I assist you with our voting verification system today? आप कैसे हैं?",
      sender: "support",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive, but only if user is already at the bottom
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Only auto-scroll if the user is already at or near the bottom
    if (shouldAutoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    
    // Force an initial scroll to bottom when chat is first opened
    if (messages.length === 1) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
      }, 100)
    }
  }, [messages, shouldAutoScroll])
  
  // Check scroll position to determine if auto-scroll should be enabled
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target;
      // If user is within 150px of the bottom, enable auto-scroll
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShouldAutoScroll(isNearBottom);
    }
  }
  
  // Force scroll to bottom when chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" })
        setShouldAutoScroll(true)
      }, 300)
    }
  }, [isOpen])

  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI("AIzaSyCJGr5HVkZxmCbNL6AS4kutuOw32oHvkjs")
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

  // Handle AI chat responses
  useEffect(() => {
    let typingTimeout: NodeJS.Timeout

    const getAIResponse = async (userMessage: string) => {
      try {
        // Format chat history for Gemini API
        // The API requires that if history is provided, the first message must have a 'user' role
        let chatHistory: { role: string; parts: { text: string }[] }[] = [];
        
        // If this is the first user message, include a prompt to set the AI's role
        if (messages.length === 2 && messages[1].sender === "user") {
          // For the first message, we'll include instructions as the first user message
          chatHistory = [
            {
              role: "user",
              parts: [{ text: "You are an Indian Voter Technical Agent who assists with the voting verification system. Please respond to my questions about voting in India." }]
            },
            {
              role: "model",
              parts: [{ text: "I understand. I'll act as an Indian Voter Technical Agent responsible for handling voter registration and verification using blockchain and biometric technology. I can help with questions about fingerprint scanning, Aadhaar verification, voice verification in multiple languages, blockchain security, voting booth procedures, and technical issues. How can I assist you today?" }]
            }
          ];
        }
        else if (messages.length > 1) {
          // Convert our messages to Gemini format
          const formattedMessages = messages.slice(0, -1).map(msg => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          }));
          
          // Ensure the first message is always from a user
          if (formattedMessages.length > 0) {
            if (formattedMessages[0].role === "model") {
              // If the first message is from the model, add a dummy user message before it
              chatHistory = [
                { role: "user", parts: [{ text: "Hello" }] },
                ...formattedMessages
              ];
            } else {
              // If first message is already from user, use the formatted messages as is
              chatHistory = formattedMessages;
            }
          }
        }
          
        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            temperature: 0.7,
          }
        })

        const result = await chat.sendMessage(userMessage)
        const response = await result.response
        const text = response.text()

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: text,
            sender: "support",
            timestamp: new Date(),
          },
        ])
      } catch (error) {
        console.error("Error getting AI response:", error)
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            content: "I apologize, but I'm having trouble connecting right now. Please try again later.",
            sender: "support",
            timestamp: new Date(),
          },
        ])
      } finally {
        setIsTyping(false)
      }
    }

    if (messages.length > 0 && messages[messages.length - 1].sender === "user") {
      setIsTyping(true)
      const userMessage = messages[messages.length - 1].content
      typingTimeout = setTimeout(() => {
        getAIResponse(userMessage)
      }, 1000)
    }

    return () => clearTimeout(typingTimeout)
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: inputValue,
          sender: "user",
          timestamp: new Date(),
        },
      ])
      setInputValue("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) return null

  // Function to handle clicks outside the chat box
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if the click is directly on the overlay, not on the chat box
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOverlayClick}
    >
      <Card className="w-full max-w-md h-[600px] flex flex-col overflow-hidden">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/chatbotimage.png" alt="Support Agent" />
                <AvatarFallback>TS</AvatarFallback>
              </Avatar>
              <CardTitle className="text-lg">Voter Technical Support</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2 px-4 py-2">
            <TabsTrigger value="chat">Voter Support</TabsTrigger>
            <TabsTrigger value="video">Video Call</TabsTrigger>
          </TabsList>

          <TabsContent
            value="chat"
            className="flex-1 flex flex-col data-[state=active]:flex data-[state=inactive]:hidden overflow-hidden"
          >
            <ScrollArea 
              className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-240px)]" 
              onScroll={handleScroll}
              ref={scrollAreaRef}
              scrollHideDelay={300}>
              <div className="space-y-4 w-full flex flex-col">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="mt-1 text-right text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <CardFooter className="border-t p-4 min-h-[80px] flex-shrink-0">
              <div className="flex w-full items-center gap-2">
                <Button variant="outline" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                  <span className="sr-only">Attach file</span>
                </Button>
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                />
                <Button size="icon" className="shrink-0" onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </CardFooter>
          </TabsContent>

          <TabsContent
            value="video"
            className="flex-1 flex flex-col items-center justify-center data-[state=active]:flex data-[state=inactive]:hidden"
          >
            <div className="text-center">
              <Video className="mx-auto h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-xl font-bold">Start Video Call</h3>
              <p className="mt-2 text-muted-foreground">
                Connect with a technical support specialist via video
              </p>
              <Button
                className="mt-4"
                onClick={() => window.open('https://meet.google.com/new', '_blank')}
              >
                Start Video Call
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}

