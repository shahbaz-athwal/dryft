import axios, { type AxiosInstance } from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

// Create a cookie jar and an axios instance that uses it
const jar = new CookieJar();
export const client: AxiosInstance = wrapper(
  axios.create({
    jar,
    baseURL: "https://collss.acadiau.ca",
    withCredentials: true,
    validateStatus: () => true,
  }),
);
