const sql = require("mssql");
const axios = require("axios");
const Request = require("../models/request"); // Adjust the path to your model

jest.mock("mssql");
jest.mock("axios");