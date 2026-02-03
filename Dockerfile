# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Preview stage
FROM node:20-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose the port (matching vite.config.ts)
EXPOSE 6868

# Run the preview command
# We use --host 0.0.0.0 to make it accessible outside the container
# and --port 6868 to match the project's config
# CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "6868"]
CMD ["npm", "run", "preview"]