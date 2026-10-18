FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
# bcrypt ships prebuilt binaries, so no install scripts are needed.
RUN npm ci --omit=dev --ignore-scripts
COPY index.js app.js ./
COPY controllers ./controllers
COPY middleware ./middleware
COPY models ./models
COPY routes ./routes
COPY scripts ./scripts
COPY utils ./utils
USER node
EXPOSE 5000
CMD ["node", "index.js"]
