import axios from "axios";

const BASE_URL = "https://registrar.acadiau.ca";

const client = axios.create({
  baseURL: BASE_URL,
  validateStatus: (status) => {
    return status >= 200 && status < 500;
  },
});

export { client };
