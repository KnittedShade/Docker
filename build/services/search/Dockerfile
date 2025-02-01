FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# List installed packages
RUN npm list

# Output contents of node_modules
RUN ls -la node_modules

# Copy application files
COPY . .

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "scholarScraper.js"]