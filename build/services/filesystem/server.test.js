import { expect } from 'chai';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import http from 'http';
import app from './server.js'; // Ensure this path is correct and includes the .js extension

const secretKey = 'your_secret_key'; // Replace with the same secret key used in server.js

let server;
let baseURL;

before((done) => {
  console.log('Starting server...');
  server = http.createServer(app).listen(0, () => {
    const port = server.address().port;
    baseURL = `http://localhost:${port}`;
    console.log(`Server started at ${baseURL}`); // Add logging to verify server start
    done();
  });
});