# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the entire application to the container
COPY . .

# Build your React application
RUN npm run build

# Expose the port that Vite runs on
EXPOSE 6868

# Define the command to start your application
CMD ["npm", "run", "preview"]
