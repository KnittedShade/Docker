const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Store connected services
const connectedServices = new Map();

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', connectedServices: Array.from(connectedServices.keys()) });
});

wss.on('connection', (ws) => {
    console.log('New connection established');
    let serviceId = null;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received message:', data);

            if (data.type === 'register') {
                serviceId = data.service;
                connectedServices.set(serviceId, ws);
                console.log(`Service registered: ${serviceId}`);
                
                // Send acknowledgment
                ws.send(JSON.stringify({
                    type: 'registration_success',
                    service: serviceId,
                    timestamp: new Date().toISOString()
                }));
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (serviceId) {
            connectedServices.delete(serviceId);
            console.log(`Service disconnected: ${serviceId}`);
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

const port = process.env.PORT || 3001;
server.listen(port, '0.0.0.0', () => {
    console.log(`Coordinator service listening on port ${port}`);
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});