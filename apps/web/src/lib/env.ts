const MODE = import.meta.env.MODE;

export const API_BASE_URL =
  MODE === "development"
    ? import.meta.env.VITE_DEV_API_URL
    : import.meta.env.VITE_API_URL;
