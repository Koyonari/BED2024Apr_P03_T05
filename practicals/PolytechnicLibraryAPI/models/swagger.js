const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["../app.js"];

const doc = {
  info: {
    title: "Polytechnic Library",
    description: "Have a wide variety and genres of books for everyone, young and old to enjoy!",
  },
  host: "localhost:3500",
};

swaggerAutogen(outputFile, routes, doc);