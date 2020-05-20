FROM node:10.15-alpine

ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN

WORKDIR /app

# Note: We ignore node_modules in .dockerignore.
#       This ensures a fresh build if `npm install`
#       has been run locally.
COPY . /app

# Note: We use the same base npm file that the Bitbucket pipeline expects
#       however `npm install` is looking for .npmrc explictly
ADD .npmrc_config .npmrc

RUN apk add --no-cache alpine-sdk python
RUN npm install && \
    rm -rf .git/ && \
    date > ./DOCKER_IMAGE_BUILD_DATE

CMD ["npm", "start"]
