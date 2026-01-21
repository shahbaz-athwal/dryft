import https from "node:https";
import axios from "axios";

const BASE_URL = "https://collss.acadiau.ca";

const client = axios.create({
  baseURL: BASE_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

export { client };
