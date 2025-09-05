// Interview-specific tools for AI interview functionality
interface Tool {
    type: 'function';
    name: string;
    description: string;
    parameters?: {
      type: string;
      properties: Record<string, {
        type: string;
        description: string;
      }>;
    };
}

const interviewToolDefinitions = {
    startInterview: {
        description: 'Starts the AI interview session and greets the candidate',
        parameters: {
            type: 'object',
            properties: {}
        }
    },
    askQuestion: {
        description: 'Asks a specific interview question to the candidate',
        parameters: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: 'The interview question to ask the candidate'
                },
                category: {
                    type: 'string',
                    description: 'The category of the question (technical, behavioral, situational, etc.)'
                }
            }
        }
    },
    evaluateAnswer: {
        description: 'Evaluates the candidate\'s answer to an interview question',
        parameters: {
            type: 'object',
            properties: {
                question: {
                    type: 'string',
                    description: 'The question that was asked'
                },
                answer: {
                    type: 'string',
                    description: 'The candidate\'s answer'
                },
                category: {
                    type: 'string',
                    description: 'The category of the question'
                }
            }
        }
    },
    endInterview: {
        description: 'Ends the interview session and provides a summary',
        parameters: {
            type: 'object',
            properties: {
                summary: {
                    type: 'string',
                    description: 'A summary of the interview performance'
                },
                score: {
                    type: 'number',
                    description: 'Overall interview score (0-100)'
                }
            }
        }
    },
    generateQuestions: {
        description: 'Generates interview questions based on job requirements',
        parameters: {
            type: 'object',
            properties: {
                jobTitle: {
                    type: 'string',
                    description: 'The job title for the position'
                },
                jobDescription: {
                    type: 'string',
                    description: 'The job description and requirements'
                },
                questionType: {
                    type: 'string',
                    description: 'Type of questions to generate (technical, behavioral, situational)'
                }
            }
        }
    },
    takeNotes: {
        description: 'Takes notes during the interview for later review',
        parameters: {
            type: 'object',
            properties: {
                note: {
                    type: 'string',
                    description: 'The note to record'
                },
                category: {
                    type: 'string',
                    description: 'Category of the note (strength, weakness, concern, etc.)'
                }
            }
        }
    }
} as const;

const interviewTools: Tool[] = Object.entries(interviewToolDefinitions).map(([name, config]) => ({
    type: "function",
    name,
    description: config.description,
    parameters: config.parameters
}));

export type { Tool };
export { interviewTools };
