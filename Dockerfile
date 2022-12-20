FROM node:16-alpine

# Set workdir and volumes
WORKDIR /app
VOLUME [ "/app/build/courses" ]

# Install cron
RUN apk add --no-cache dcron

# Copy public files
COPY public /app/public

# Copy package.json and install dependencies
COPY yarn.lock /app
COPY package.json /app
RUN yarn

# Copy source files
COPY src /app/src
COPY tsconfig.json /app

# Build web app
RUN yarn build

# Copy start script and crawl script
COPY start.sh /app/start.sh
COPY crawl.js /app

# Expose port
EXPOSE 3000

# Set entrypoint
ENTRYPOINT [ "/app/start.sh" ]