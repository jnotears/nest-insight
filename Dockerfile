FROM node:12-alpine
WORKDIR /build
COPY . .
RUN npm i
RUN npm run build
RUN rm -rf node_modules
RUN mkdir /app
RUN cp -a dist/* /app
RUN cp package.json /app
RUN cp package-lock.json /app
WORKDIR /app
RUN npm i --only=production

FROM node:12-alpine 
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=0 /app .
CMD ["node", "main.js"]