"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThreeDotsWave from "@/components/ui/three-dots-wave";
import { Conversation } from "@/lib/conversations";
// Removed translations - using English only

/**
* Avatar building blocks with Radix
*/
const Avatar = React.forwardRef<
 React.ElementRef<typeof AvatarPrimitive.Root>,
 React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
 <AvatarPrimitive.Root
   ref={ref}
   className={cn(
     "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
     className,
   )}
   {...props}
 />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
 React.ElementRef<typeof AvatarPrimitive.Image>,
 React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
 <AvatarPrimitive.Image
   ref={ref}
   className={cn("aspect-square h-full w-full", className)}
   {...props}
 />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
 React.ElementRef<typeof AvatarPrimitive.Fallback>,
 React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
 <AvatarPrimitive.Fallback
   ref={ref}
   className={cn(
     "flex h-full w-full items-center justify-center rounded-full bg-muted",
     className,
   )}
   {...props}
 />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
* Decide if a conversation item should be displayed or filtered out. 
* Optional, this is used to filter out empty or useless user messages (e.g., final + empty text)
*/
function shouldDisplayMessage(msg: Conversation): boolean {
 const { role, text, status, isFinal } = msg;

 if (role === "assistant") {
   // Always display assistant messages (even if they're empty, though that’s rare).
   return true;
 } else {
   // User role
   // 1) If user is currently speaking or processing, we show it (wave or “Processing…”).
   if (status === "speaking" || status === "processing") {
     return true;
   }
   // 2) If user is final, only show if the transcript is non-empty.
   if (isFinal && text.trim().length > 0) {
     return true;
   }
   // Otherwise, skip.
   return false;
 }
}

/**
* Single conversation item
*/
function ConversationItem({ message }: { message: Conversation }) {
 const isUser = message.role === "user";
 const isAssistant = message.role === "assistant";
 const msgStatus = message.status;

 return (
   <motion.div
     initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
     animate={{ opacity: 1, x: 0, y: 0 }}
     transition={{ duration: 0.3, ease: "easeOut" }}
     className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}
   >
     {/* Assistant Avatar */}
     {isAssistant && (
       <Avatar className="w-8 h-8 shrink-0 ring-2 ring-blue-100 dark:ring-blue-900">
         <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
           AI
         </AvatarFallback>
       </Avatar>
     )}

     {/* Message Bubble */}
     <div
       className={`${
         isUser
           ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
           : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
       } px-4 py-3 rounded-2xl max-w-[75%] shadow-sm ${
         isUser ? "rounded-br-md" : "rounded-bl-md"
       }`}
     >
       {(isUser && msgStatus === "speaking") || msgStatus === "processing" ? (
         // Show wave animation for "speaking" status
         <div className="flex items-center gap-1">
           <ThreeDotsWave />
           <span className="text-sm opacity-70">
             {isUser ? "Speaking..." : "Processing..."}
           </span>
         </div>
       ) : (
         // Otherwise, show the message text
         <div>
           <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
           {/* Timestamp */}
           <div className={`text-xs mt-1 ${
             isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
           }`}>
             {new Date(message.timestamp).toLocaleTimeString("en-US", {
               hour: "numeric",
               minute: "numeric",
               second: "2-digit"
             })}
           </div>
         </div>
       )}
     </div>

     {/* User Avatar */}
     {isUser && (
       <Avatar className="w-8 h-8 shrink-0 ring-2 ring-blue-100 dark:ring-blue-900">
         <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold">
           You
         </AvatarFallback>
       </Avatar>
     )}
   </motion.div>
 );
}

interface TranscriberProps {
 conversation: Conversation[];
}


export default function Transcriber({ conversation }: TranscriberProps) {
 const scrollRef = React.useRef<HTMLDivElement>(null);

 // Scroll to bottom whenever conversation updates
 React.useEffect(() => {
   if (scrollRef.current) {
     scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
   }
 }, [conversation]);

 // Filter out messages that we do not want to display
 const displayableMessages = React.useMemo(() => {
   return conversation.filter(shouldDisplayMessage);
 }, [conversation]);

 return (
   <div className="flex flex-col w-full h-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden dark:bg-background">
     {/* Header */}
     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-4 py-3 flex items-center justify-between border-b">
       <div className="flex items-center gap-2">
         <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
         <div className="font-medium text-foreground">
          Live Interview Transcript
         </div>
       </div>
       <div className="text-xs text-muted-foreground">
         {displayableMessages.length} messages
       </div>
     </div>

     {/* Body */}
     <div
       ref={scrollRef}
       className="flex-1 h-full overflow-y-auto p-4 space-y-3 z-50 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent"
     >
       {displayableMessages.length === 0 ? (
         <div className="flex items-center justify-center h-full text-muted-foreground">
           <div className="text-center">
             <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
               </svg>
             </div>
             <p className="text-sm">Interview will begin when you start the conversation</p>
           </div>
         </div>
       ) : (
         <AnimatePresence>
           {displayableMessages.map((message) => (
             <ConversationItem key={message.id} message={message} />
           ))}
         </AnimatePresence>
       )}
     </div>
   </div>
 );
}

export { Avatar, AvatarImage, AvatarFallback };
