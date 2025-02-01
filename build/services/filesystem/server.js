const express = require('express');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const connectToCoordinator = () => {
    const wsUrl = process.env.COORDINATOR_URL || 'ws://coordinator:3001';
    console.log(`Attempting to connect to coordinator at ${wsUrl}`);
    
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(wsUrl);
        
        const timeout = setTimeout(() => {
            ws.close();
            reject(new Error('Connection timeout'));
        }, 5000);

        ws.on('open', () => {
            clearTimeout(timeout);
            console.log('Successfully connected to coordinator');
            ws.send(JSON.stringify({ 
                type: 'register', 
                service: 'filesystem',
                timestamp: new Date().toISOString()
            }));
            resolve(ws);
        });

        ws.on('error', (error) => {
            clearTimeout(timeout);
            console.error('WebSocket connection error:', error);
            reject(error);
        });
    });
};

const startServer = async () => {
    try {
        const port = process.env.PORT || 3000;
        app.listen(port, '0.0.0.0', () => {
            console.log(`Filesystem service listening on port ${port}`);
        });

        const retryConnection = async (retryCount = 0) => {
            try {
                const ws = await connectToCoordinator();
                // Handle WebSocket connection
                ws.on('message', (message) => {
                    console.log('Received message from coordinator:', message.toString());
                });
                
                ws.on('close', () => {
                    console.log('Connection to coordinator closed. Retrying...');
                    setTimeout(() => retryConnection(0), 5000);
                });
            } catch (error) {
                const nextRetry = Math.min(retryCount + 1, 12);
                const delay = Math.pow(2, retryCount) * 1000;
                console.log(`Connection attempt failed. Retrying in ${delay/1000} seconds...`);
                setTimeout(() => retryConnection(nextRetry), delay);
            }
        };

        retryConnection();
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
};

startServer();