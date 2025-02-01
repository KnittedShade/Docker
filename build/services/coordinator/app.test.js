import { expect } from 'chai';
import fetch from 'node-fetch';
import http from 'http';
import app from './app.js'; // Ensure this path is correct and includes the .js extension

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

after((done) => {
  console.log('Closing server...');
  server.close(done);
});

describe('Coordinator Service', () => {
  it('should return Hello from coordinator service!', async () => {
    console.log(`Fetching from ${baseURL}`); // Add logging to verify baseURL
    if (!baseURL) {
      throw new Error('baseURL is not set');
    }
    const response = await fetch(baseURL);
    const text = await response.text();
    console.log(`Response status: ${response.status}`); // Add logging to verify response status
    console.log(`Response text: ${text}`); // Add logging to verify response text
    expect(response.status).to.equal(200);
    expect(text).to.equal('Hello from coordinator service!');
  });
});
