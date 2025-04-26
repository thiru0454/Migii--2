import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import config from './config.js';
import { realtimeService } from './services/realtimeService.js';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Log environment variables (excluding sensitive data)
console.log('Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Configured' : 'Not configured');

const app = express();

// Basic health check endpoint
app.get('/', (req, res) => {
  console.log('Received request to root endpoint');
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// MongoDB Connection
console.log('Attempting to connect to MongoDB...');
const connectToMongoDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
};

// Check if port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

// Find available port
const findAvailablePort = async (startPort) => {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
  }
  return port;
};

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? 
    process.env.CORS_ORIGIN.split(',') : 
    ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

console.log('CORS configuration:', corsOptions);

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Increase timeout for long-running requests
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.error('Request timeout');
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Received health check request');
  const dbState = mongoose.connection.readyState;
  const isConnected = dbState === 1;
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected',
    dbState: dbState
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

let server;

const startServer = async () => {
  try {
    // Try to connect to MongoDB
    const isConnected = await connectToMongoDB();
    
    // Find available port
    const desiredPort = process.env.PORT || 3000;
    const port = await findAvailablePort(desiredPort);
    
    if (port !== desiredPort) {
      console.log(`Port ${desiredPort} is in use, using port ${port} instead`);
    }
    
    // Start the server
    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Health check available at: http://localhost:${port}/api/health`);
    });

    // Initialize WebSocket server
    console.log('Initializing WebSocket server...');
    const wss = new WebSocketServer({ server });

    // WebSocket connection handling
    wss.on('connection', (ws, req) => {
      const clientId = uuidv4();
      console.log(`New WebSocket connection from ${req.socket.remoteAddress} (ID: ${clientId})`);
      
      // Add client to realtime service
      realtimeService.addClient(clientId, ws);
      
      // Handle client messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('Received message from client:', data);
        } catch (error) {
          console.error('Error parsing client message:', error);
        }
      });
      
      // Handle client disconnection
      ws.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        realtimeService.removeClient(clientId);
      });

      // Handle WebSocket errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });
    });

    // If MongoDB is connected, initialize change streams
    if (isConnected) {
      console.log('Initializing change streams...');
      await realtimeService.initializeChangeStreams();
    }

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle server errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  // Don't exit the process, just log the error
});

// Start the server
startServer();

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, cleaning up...');
  realtimeService.cleanup();
  server.close(() => {
    console.log('Server shutdown complete');
    process.exit(0);
  });
}); 