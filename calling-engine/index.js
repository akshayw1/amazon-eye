import Fastify from "fastify";
import WebSocket from "ws";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import Twilio from "twilio";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Load environment variables from .env file
dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

// Enhanced logging utility
class Logger {
  static formatLog(level, category, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      category,
      message,
      ...meta
    };
    
    const colorCodes = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[36m',    // Cyan
      DEBUG: '\x1b[35m',   // Magenta
      SUCCESS: '\x1b[32m', // Green
      RESET: '\x1b[0m'     // Reset
    };
    
    const color = colorCodes[level.toUpperCase()] || colorCodes.INFO;
    console.log(`${color}[${timestamp}] ${level.toUpperCase()} [${category}] ${message}${colorCodes.RESET}`);
    
    if (Object.keys(meta).length > 0) {
      console.log(`${color}${JSON.stringify(meta, null, 2)}${colorCodes.RESET}`);
    }
  }

  static error(category, message, meta = {}) {
    this.formatLog('ERROR', category, message, meta);
  }

  static warn(category, message, meta = {}) {
    this.formatLog('WARN', category, message, meta);
  }

  static info(category, message, meta = {}) {
    this.formatLog('INFO', category, message, meta);
  }

  static debug(category, message, meta = {}) {
    this.formatLog('DEBUG', category, message, meta);
  }

  static success(category, message, meta = {}) {
    this.formatLog('SUCCESS', category, message, meta);
  }
}

// Call tracking store
const activeCallsTracker = new Map();

// Check for required environment variables
const {
  ELEVENLABS_API_KEY,
  ELEVENLABS_AGENT_ID,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  SCHEDULER_SERVICE_URL
} = process.env;

Logger.info('STARTUP', 'Initializing calling service...');

if (
  !ELEVENLABS_API_KEY ||
  !ELEVENLABS_AGENT_ID ||
  !TWILIO_ACCOUNT_SID ||
  !TWILIO_AUTH_TOKEN ||
  !TWILIO_PHONE_NUMBER ||
  !SCHEDULER_SERVICE_URL
) {
  Logger.error('STARTUP', 'Missing required environment variables', {
    hasElevenLabsKey: !!ELEVENLABS_API_KEY,
    hasElevenLabsAgent: !!ELEVENLABS_AGENT_ID,
    hasTwilioSid: !!TWILIO_ACCOUNT_SID,
    hasTwilioToken: !!TWILIO_AUTH_TOKEN,
    hasTwilioPhone: !!TWILIO_PHONE_NUMBER,
    hasSchedulerUrl: !!SCHEDULER_SERVICE_URL
  });
  throw new Error("Missing required environment variables");
}

Logger.success('STARTUP', 'All environment variables loaded successfully');

// Initialize Fastify server
const fastify = Fastify({
  requestIdHeader: 'x-request-id',
  genReqId: () => uuidv4()
});

fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

const PORT = process.env.PORT || 8000;

// Add request logging middleware
fastify.addHook('onRequest', async (request, reply) => {
  const startTime = Date.now();
  request.startTime = startTime;
  
  Logger.info('HTTP_REQUEST', `${request.method} ${request.url}`, {
    requestId: request.id,
    method: request.method,
    url: request.url,
    userAgent: request.headers['user-agent'],
    ip: request.ip
  });
});

fastify.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - request.startTime;
  
  Logger.info('HTTP_RESPONSE', `${request.method} ${request.url} - ${reply.statusCode}`, {
    requestId: request.id,
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration: `${duration}ms`
  });
});

// Root route for health check
fastify.get("/", async (request, reply) => {
  Logger.info('HEALTH_CHECK', 'Health check requested', { requestId: request.id });
  reply.send({ 
    message: "Server is running",
    timestamp: new Date().toISOString(),
    activeCalls: activeCallsTracker.size
  });
});

// Initialize Twilio client
const twilioClient = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
Logger.success('TWILIO', 'Twilio client initialized successfully');

// Helper function to get signed URL for authenticated conversations
async function getSignedUrl() {
  const requestId = uuidv4();
  
  try {
    Logger.info('ELEVENLABS_AUTH', 'Requesting signed URL from ElevenLabs', { 
      requestId,
      agentId: ELEVENLABS_AGENT_ID 
    });
    
    const startTime = Date.now();
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`,
      {
        method: "GET",
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
        },
      }
    );

    const duration = Date.now() - startTime;

    if (!response.ok) {
      Logger.error('ELEVENLABS_AUTH', 'Failed to get signed URL', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        duration: `${duration}ms`
      });
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = await response.json();
    
    Logger.success('ELEVENLABS_AUTH', 'Successfully obtained signed URL', {
      requestId,
      duration: `${duration}ms`,
      hasSignedUrl: !!data.signed_url
    });
    
    return data.signed_url;
  } catch (error) {
    Logger.error('ELEVENLABS_AUTH', 'Error getting signed URL', {
      requestId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Route to initiate outbound calls
fastify.post("/outbound-call", async (request, reply) => {
  const requestId = request.id;
  const { number, prompt, first_message } = request.body;

  Logger.info('OUTBOUND_CALL', 'Outbound call request received', {
    requestId,
    number: number ? `${number.substring(0, 3)}****${number.substring(number.length - 4)}` : 'missing', // Mask phone number for privacy
    hasPrompt: !!prompt,
    hasFirstMessage: !!first_message,
    promptLength: prompt ? prompt.length : 0,
    firstMessageLength: first_message ? first_message.length : 0
  });

  if (!number) {
    Logger.warn('OUTBOUND_CALL', 'Phone number missing in request', { requestId });
    return reply.code(400).send({ error: "Phone number is required" });
  }

  try {
    const callStartTime = Date.now();
    
    Logger.info('TWILIO_CALL', 'Initiating Twilio call', {
      requestId,
      fromNumber: TWILIO_PHONE_NUMBER,
      toNumber: `${number.substring(0, 3)}****${number.substring(number.length - 4)}`
    });

    const call = await twilioClient.calls.create({
      from: TWILIO_PHONE_NUMBER,
      to: number,
      url: `https://${
        request.headers.host
      }/outbound-call-twiml?prompt=${encodeURIComponent(
        prompt
      )}&first_message=${encodeURIComponent(first_message)}`,
    });

    const callDuration = Date.now() - callStartTime;

    // Track the call
    activeCallsTracker.set(call.sid, {
      callSid: call.sid,
      number: number,
      startTime: new Date(),
      requestId: requestId,
      status: 'initiated'
    });

    Logger.success('TWILIO_CALL', 'Call initiated successfully', {
      requestId,
      callSid: call.sid,
      duration: `${callDuration}ms`,
      activeCallsCount: activeCallsTracker.size
    });

    reply.send({
      success: true,
      message: "Call initiated",
      callSid: call.sid,
    });
  } catch (error) {
    Logger.error('TWILIO_CALL', 'Error initiating outbound call', {
      requestId,
      error: error.message,
      stack: error.stack,
      twilioCode: error.code,
      twilioStatus: error.status
    });
    
    reply.code(500).send({
      success: false,
      error: "Failed to initiate call",
    });
  }
});

// TwiML route for outbound calls
fastify.all("/outbound-call-twiml", async (request, reply) => {
  const requestId = request.id;
  const prompt = request.query.prompt || "";
  const first_message = request.query.first_message || "";

  Logger.info('TWIML_REQUEST', 'TwiML endpoint called', {
    requestId,
    method: request.method,
    hasPrompt: !!prompt,
    hasFirstMessage: !!first_message,
    host: request.headers.host
  });

  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Connect>
          <Stream url="wss://${request.headers.host}/outbound-media-stream">
            <Parameter name="prompt" value="${prompt}" />
            <Parameter name="first_message" value="${first_message}" />
          </Stream>
        </Connect>
      </Response>`;

  Logger.debug('TWIML_RESPONSE', 'Sending TwiML response', {
    requestId,
    responseLength: twimlResponse.length
  });

  reply.type("text/xml").send(twimlResponse);
});

// WebSocket route for handling media streams
fastify.register(async fastifyInstance => {
  fastifyInstance.get(
    "/outbound-media-stream",
    { websocket: true },
    (ws, req) => {
      const connectionId = uuidv4();
      const connectionStartTime = Date.now();
      
      Logger.info('WEBSOCKET', 'Twilio connected to outbound media stream', {
        connectionId,
        clientIP: req.ip,
        userAgent: req.headers['user-agent']
      });

      // Variables to track the call
      let streamSid = null;
      let callSid = null;
      let elevenLabsWs = null;
      let customParameters = null;
      let transcriptCollection = [];
      let callMetrics = {
        audioChunksReceived: 0,
        audioChunksSent: 0,
        agentResponses: 0,
        userTranscripts: 0,
        interruptionsHandled: 0
      };

      // Handle WebSocket errors
      ws.on("error", (error) => {
        Logger.error('WEBSOCKET', 'WebSocket error', {
          connectionId,
          callSid,
          error: error.message,
          stack: error.stack
        });
      });

      // Set up ElevenLabs connection
      const setupElevenLabs = async () => {
        try {
          Logger.info('ELEVENLABS_SETUP', 'Setting up ElevenLabs connection', {
            connectionId,
            callSid
          });

          const signedUrl = await getSignedUrl();
          elevenLabsWs = new WebSocket(signedUrl);

          elevenLabsWs.on("open", () => {
            Logger.success('ELEVENLABS_WS', 'Connected to Conversational AI', {
              connectionId,
              callSid
            });

            // Send initial configuration with prompt and first message
            const initialConfig = {
              type: "conversation_initiation_client_data",
              conversation_config_override: {
                agent: {
                  prompt: {
                    prompt:
                      customParameters?.prompt ||
                      "you are a gary from the phone store",
                  },
                  first_message:
                    customParameters?.first_message ||
                    "hey there! how can I help you today?",
                },
              },
            };

            Logger.info('ELEVENLABS_CONFIG', 'Sending initial configuration', {
              connectionId,
              callSid,
              promptLength: initialConfig.conversation_config_override.agent.prompt.prompt.length,
              firstMessageLength: initialConfig.conversation_config_override.agent.first_message.length
            });

            // Send the configuration to ElevenLabs
            elevenLabsWs.send(JSON.stringify(initialConfig));
          });

          elevenLabsWs.on("message", data => {
            try {
              const message = JSON.parse(data);

              switch (message.type) {
                case "conversation_initiation_metadata":
                  Logger.info('ELEVENLABS_METADATA', 'Received initiation metadata', {
                    connectionId,
                    callSid
                  });
                  break;

                case "audio":
                  callMetrics.audioChunksSent++;
                  
                  if (streamSid) {
                    if (message.audio?.chunk) {
                      const audioData = {
                        event: "media",
                        streamSid,
                        media: {
                          payload: message.audio.chunk,
                        },
                      };
                      ws.send(JSON.stringify(audioData));
                    } else if (message.audio_event?.audio_base_64) {
                      const audioData = {
                        event: "media",
                        streamSid,
                        media: {
                          payload: message.audio_event.audio_base_64,
                        },
                      };
                      ws.send(JSON.stringify(audioData));
                    }
                    
                    if (callMetrics.audioChunksSent % 100 === 0) {
                      Logger.debug('AUDIO_METRICS', 'Audio chunk metrics', {
                        connectionId,
                        callSid,
                        audioChunksSent: callMetrics.audioChunksSent,
                        audioChunksReceived: callMetrics.audioChunksReceived
                      });
                    }
                  } else {
                    Logger.warn('ELEVENLABS_AUDIO', 'Received audio but no StreamSid yet', {
                      connectionId,
                      callSid
                    });
                  }
                  break;

                case "interruption":
                  callMetrics.interruptionsHandled++;
                  Logger.info('ELEVENLABS_INTERRUPTION', 'Handling interruption', {
                    connectionId,
                    callSid,
                    totalInterruptions: callMetrics.interruptionsHandled
                  });
                  
                  if (streamSid) {
                    ws.send(
                      JSON.stringify({
                        event: "clear",
                        streamSid,
                      })
                    );
                  }
                  break;

                case "ping":
                  if (message.ping_event?.event_id) {
                    elevenLabsWs.send(
                      JSON.stringify({
                        type: "pong",
                        event_id: message.ping_event.event_id,
                      })
                    );
                    Logger.debug('ELEVENLABS_PING', 'Ping/pong handled', {
                      connectionId,
                      callSid,
                      eventId: message.ping_event.event_id
                    });
                  }
                  break;

                case "agent_response":
                  const agentResponse = message.agent_response_event?.agent_response;
                  callMetrics.agentResponses++;
                  
                  Logger.info('AGENT_RESPONSE', 'Agent response received', {
                    connectionId,
                    callSid,
                    responseLength: agentResponse?.length || 0,
                    totalResponses: callMetrics.agentResponses,
                    response: agentResponse?.substring(0, 100) + (agentResponse?.length > 100 ? '...' : '')
                  });
                  
                  if (agentResponse) {
                    transcriptCollection.push({
                      type: 'agent',
                      text: agentResponse,
                      timestamp: new Date().toISOString()
                    });
                  }
                  break;

                case "user_transcript":
                  const userTranscript = message.user_transcription_event?.user_transcript;
                  callMetrics.userTranscripts++;
                  
                  Logger.info('USER_TRANSCRIPT', 'User transcript received', {
                    connectionId,
                    callSid,
                    transcriptLength: userTranscript?.length || 0,
                    totalTranscripts: callMetrics.userTranscripts,
                    transcript: userTranscript?.substring(0, 100) + (userTranscript?.length > 100 ? '...' : '')
                  });
                  
                  if (userTranscript) {
                    transcriptCollection.push({
                      type: 'user',
                      text: userTranscript,
                      timestamp: new Date().toISOString()
                    });
                  }
                  break;

                default:
                  Logger.debug('ELEVENLABS_MESSAGE', 'Unhandled message type', {
                    connectionId,
                    callSid,
                    messageType: message.type
                  });
              }
            } catch (error) {
              Logger.error('ELEVENLABS_MESSAGE', 'Error processing message', {
                connectionId,
                callSid,
                error: error.message,
                stack: error.stack
              });
            }
          });

          elevenLabsWs.on("error", error => {
            Logger.error('ELEVENLABS_WS', 'WebSocket error', {
              connectionId,
              callSid,
              error: error.message,
              stack: error.stack
            });
          });

          elevenLabsWs.on("close", (code, reason) => {
            Logger.info('ELEVENLABS_WS', 'WebSocket disconnected', {
              connectionId,
              callSid,
              closeCode: code,
              closeReason: reason?.toString()
            });
          });
        } catch (error) {
          Logger.error('ELEVENLABS_SETUP', 'Setup error', {
            connectionId,
            callSid,
            error: error.message,
            stack: error.stack
          });
        }
      };

      // Set up ElevenLabs connection
      setupElevenLabs();

      // Handle messages from Twilio
      ws.on("message", message => {
        try {
          const msg = JSON.parse(message);
          
          if (msg.event !== "media") {
            Logger.info('TWILIO_EVENT', `Received event: ${msg.event}`, {
              connectionId,
              callSid,
              event: msg.event
            });
          }

          switch (msg.event) {
            case "start":
              streamSid = msg.start.streamSid;
              callSid = msg.start.callSid;
              customParameters = msg.start.customParameters;
              
              // Update tracker
              if (activeCallsTracker.has(callSid)) {
                activeCallsTracker.get(callSid).status = 'connected';
                activeCallsTracker.get(callSid).streamSid = streamSid;
              }
              
              Logger.success('TWILIO_START', 'Stream started successfully', {
                connectionId,
                streamSid,
                callSid,
                customParameters,
                activeCalls: activeCallsTracker.size
              });
              
              // Update call status to in-progress
              (async () => {
                try {
                  await axios.put(`${API_BASE_URL}/calls/${callSid}/status`, {
                    isCalled: 'initiated'
                  });
                  Logger.info('DATABASE_UPDATE', 'Call status updated to initiated', {
                    connectionId,
                    callSid
                  });
                } catch (error) {
                  Logger.error('DATABASE_UPDATE', 'Error updating call status', {
                    connectionId,
                    callSid,
                    error: error.message
                  });
                }
              })();
              break;

            case "media":
              callMetrics.audioChunksReceived++;
              
              if (elevenLabsWs?.readyState === WebSocket.OPEN) {
                const audioMessage = {
                  user_audio_chunk: Buffer.from(
                    msg.media.payload,
                    "base64"
                  ).toString("base64"),
                };
                elevenLabsWs.send(JSON.stringify(audioMessage));
              } else {
                Logger.warn('AUDIO_FORWARD', 'ElevenLabs WebSocket not ready for audio', {
                  connectionId,
                  callSid,
                  wsState: elevenLabsWs?.readyState
                });
              }
              break;

            case "stop":
              const callDuration = Date.now() - connectionStartTime;
              
              Logger.info('TWILIO_STOP', 'Stream ended', {
                connectionId,
                streamSid,
                callSid,
                duration: `${callDuration}ms`,
                metrics: callMetrics,
                transcriptLength: transcriptCollection.length
              });
              
              // Update tracker
              if (activeCallsTracker.has(callSid)) {
                activeCallsTracker.get(callSid).status = 'ended';
                activeCallsTracker.get(callSid).endTime = new Date();
                activeCallsTracker.get(callSid).duration = callDuration;
              }
              
              // Update transcript and status when call ends
              (async () => {
                try {
                  Logger.info('DATABASE_UPDATE', 'Updating call transcript and status', {
                    connectionId,
                    callSid,
                    transcriptLength: transcriptCollection.length
                  });

                  await axios.put(`${API_BASE_URL}/orders/returns/call/${callSid}/status`, {
                    transcript: transcriptCollection,
                    isCalled: 'completed'
                  });
                  
                  Logger.success('DATABASE_UPDATE', 'Call transcript and status updated successfully', {
                    connectionId,
                    callSid
                  });
                } catch (error) {
                  Logger.error('DATABASE_UPDATE', 'Error updating transcript and status', {
                    connectionId,
                    callSid,
                    error: error.message,
                    stack: error.stack
                  });
                }
              })();
              
              // Remove from active calls tracker
              activeCallsTracker.delete(callSid);
              
              if (elevenLabsWs?.readyState === WebSocket.OPEN) {
                elevenLabsWs.close();
              }
              break;

            default:
              Logger.debug('TWILIO_EVENT', 'Unhandled event', {
                connectionId,
                callSid,
                event: msg.event
              });
          }
        } catch (error) {
          Logger.error('TWILIO_MESSAGE', 'Error processing message', {
            connectionId,
            callSid,
            error: error.message,
            stack: error.stack
          });
        }
      });

      // Handle WebSocket closure
      ws.on("close", (code, reason) => {
        const connectionDuration = Date.now() - connectionStartTime;
        
        Logger.info('WEBSOCKET_CLOSE', 'Client disconnected', {
          connectionId,
          callSid,
          closeCode: code,
          closeReason: reason?.toString(),
          connectionDuration: `${connectionDuration}ms`,
          finalMetrics: callMetrics
        });
        
        if (elevenLabsWs?.readyState === WebSocket.OPEN) {
          elevenLabsWs.close();
        }
        
        // Clean up tracker if call is still active
        if (callSid && activeCallsTracker.has(callSid)) {
          activeCallsTracker.delete(callSid);
        }
      });
    }
  );
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  Logger.info('SHUTDOWN', 'SIGTERM received, starting graceful shutdown...');
  
  // Log active calls before shutdown
  if (activeCallsTracker.size > 0) {
    Logger.warn('SHUTDOWN', 'Active calls during shutdown', {
      activeCallsCount: activeCallsTracker.size,
      activeCalls: Array.from(activeCallsTracker.entries()).map(([callSid, info]) => ({
        callSid,
        duration: Date.now() - info.startTime.getTime(),
        status: info.status
      }))
    });
  }
  
  fastify.close(() => {
    Logger.success('SHUTDOWN', 'Server closed successfully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SHUTDOWN', 'SIGINT received, starting graceful shutdown...');
  fastify.close(() => {
    Logger.success('SHUTDOWN', 'Server closed successfully');
    process.exit(0);
  });
});

// Start the Fastify server
fastify.listen({ port: PORT, host: '0.0.0.0' }, err => {
  if (err) {
    Logger.error('STARTUP', 'Error starting server', {
      error: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
  
  Logger.success('STARTUP', `Server listening on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    timestamp: new Date().toISOString()
  });
});