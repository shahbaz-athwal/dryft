import axios, { type AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";

// Create a cookie jar and an axios instance that uses it
export const client: AxiosInstance = wrapper(
  axios.create({
    baseURL: "https://collss.acadiau.ca",
    withCredentials: true,
    validateStatus: () => true,
  }),
);
