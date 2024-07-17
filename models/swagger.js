const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger-output.json";
const routes = ["../app.js"];

const doc = {
  info: {
    title: "NutriAID",
    description: "NutriAid is a web application designed to bridge the gap between underprivileged individuals and volunteers willing to provide food aid.",
  },
  host: "localhost:3500",
};

swaggerAutogen(outputFile, routes, doc);