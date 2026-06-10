# ----- build -----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ----- runtime -----
FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
ENV NODE_ENV=production
ENV PORT=5000
COPY --from=build /app/node_modules ./node_modules
COPY . .
RUN mkdir -p logs uploads && chown -R app:app /app
USER app
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O- http://localhost:5000/health || exit 1
CMD ["node", "src/server.js"]
