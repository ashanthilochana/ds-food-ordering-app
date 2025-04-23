# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create .env file from example if it doesn't exist
RUN cp -n .env.example .env || true

# Expose the port the app runs on
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
