import axios, { type AxiosInstance } from "axios";

export const client: AxiosInstance = axios.create({
  baseURL: "https://collss.acadiau.ca",
  withCredentials: true,
  validateStatus: () => true,
});
