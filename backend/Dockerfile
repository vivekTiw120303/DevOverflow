# Base image: official Node.js image
FROM node:23-slim

# Set working directory inside container
WORKDIR /app

# Copy package files to container
COPY package*.json ./

# Install dependencies inside container
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Run the app when the container starts
CMD ["npm", "run"]