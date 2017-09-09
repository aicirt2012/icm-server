FROM node:latest

COPY package.json /
#COPY gulpfile.babel.js /
WORKDIR /
RUN npm install
#RUN npm install --dev
#RUN npm install gulp -g
#RUN gulp

WORKDIR /dist
COPY ./dist .

WORKDIR /
CMD ["node","dist/index"]
#CMD tail -f /dev/null