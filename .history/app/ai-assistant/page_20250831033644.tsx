"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
// Removed Welcome import to avoid translations issue
import { VoiceSelector } from "@/components/voice-select"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { TokenUsageDisplay } from "@/components/token-usage"
import { MessageControls } from "@/components/message-controls"
import { ToolsEducation } from "@/components/tools-education"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"

const AIAssistant: React.FC = () => {
  // State for voice selection
  const [voice, setVoice] = useState("ash")

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation
  } = useWebRTCAudioSession(voice, tools)

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: 'getCurrentTime',
        backgroundFunction: 'changeBackgroundColor',
        partyFunction: 'partyMode',
        launchWebsite: 'launchWebsite', 
        copyToClipboard: 'copyToClipboard',
        scrapeWebsite: 'scrapeWebsite'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions])

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-md-10 col-lg-8">
          <div className="card border-0 shadow-lg">
            <div className="card-header bg-gradient-primary text-white text-center py-4">
              <h1 className="card-title mb-0 h3">
                <i className="bi bi-robot me-2"></i>
                AI Voice Assistant
              </h1>
              <p className="mb-0 mt-2 opacity-75">
                Real-time AI conversation powered by OpenAI
              </p>
            </div>
            <div className="card-body p-5">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Welcome />
                
                <motion.div 
                  className="card bg-light border-0 mt-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="card-body">
                    <VoiceSelector value={voice} onValueChange={setVoice} />
                    
                    <div className="text-center my-4">
                      <BroadcastButton 
                        isSessionActive={isSessionActive} 
                        onClick={handleStartStopClick}
                      />
                    </div>
                    
                    {msgs.length > 4 && (
                      <div className="mt-3">
                        <TokenUsageDisplay messages={msgs} />
                      </div>
                    )}
                    
                    {status && (
                      <motion.div 
                        className="mt-3"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <MessageControls conversation={conversation} msgs={msgs} />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
                
                {status && (
                  <div className="mt-4">
                    <StatusDisplay status={status} />
                  </div>
                )}
                
                <div className="mt-4">
                  <ToolsEducation />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant;
