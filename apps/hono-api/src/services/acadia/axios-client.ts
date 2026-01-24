import https from "node:https";
import axios from "axios";

const BASE_URL = "https://collss.acadiau.ca";

const clientConfig = {
  baseURL: BASE_URL,
  httpsAgent: new https.Agent({
    rejectUnauthorized: false,
  }),
  validateStatus: (status: number) => {
    return status >= 200 && status < 500;
  },
};

const client = axios.create(clientConfig);

const authClient = axios.create(clientConfig);

export { client, authClient };
