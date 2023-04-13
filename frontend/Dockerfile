# First stage: Install dependencies
FROM node:lts-alpine3.14 as npm-install
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Second stage: Build the app
FROM npm-install as npm-build
WORKDIR /usr/src/app
COPY --from=npm-install /usr/src/app/node_modules /usr/src/app/node_modules
COPY . .
RUN GENERATE_SOURCEMAP=false node --max-old-space-size=1024 ./node_modules/react-scripts/scripts/build.js --bail=false --max-workers=1 && npm run build:js --memory="1g"
RUN GENERATE_SOURCEMAP=false node --max-old-space-size=1024 ./node_modules/react-scripts/scripts/build.js --bail=false --max-workers=1 && npm run build:css --memory="1g"
RUN GENERATE_SOURCEMAP=false node --max-old-space-size=1024 ./node_modules/react-scripts/scripts/build.js --bail=false --max-workers=1 && npm run build:html --memory="1g"

# Third stage: Serve the app with Nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=npm-build /usr/src/app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]