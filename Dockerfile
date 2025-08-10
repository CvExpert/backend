# Use official Node.js image as base
FROM oven/bun:1.1.13-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lockb ./
RUN bun install --production

# Copy source code
COPY . .

# Expose port (change if your app uses a different port)
EXPOSE 3000

# Start the backend server in production mode
CMD ["bun", "start"]
