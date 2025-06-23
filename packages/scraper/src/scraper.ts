import type { AxiosError, AxiosInstance } from "axios";
import { client } from "./utils/axios";

interface ScraperConfig {
  username: string;
  password: string;
}

export class AcadiaScraper {
  private client: AxiosInstance;
  private cookies: string | null = null;
  private config: ScraperConfig;
  private authTimestamp: number | null = null;
  private readonly AUTH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(config: ScraperConfig) {
    this.config = config;
    this.client = client;
  }

  private validateAuth(): boolean {
    if (!this.cookies || !this.authTimestamp) {
      return false;
    }

    const now = Date.now();
    return now - this.authTimestamp < this.AUTH_TIMEOUT_MS;
  }

  private async authenticate() {
    try {
      const formData = new URLSearchParams();
      formData.append("UserName", this.config.username);
      formData.append("Password", this.config.password);

      const response = await this.client.post(
        "/student/Account/Login",
        formData.toString(),
        {
          maxRedirects: 0,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      const setCookieHeaders = response.headers["set-cookie"];
      let allCookies: string[] = [];

      if (setCookieHeaders) {
        allCookies = setCookieHeaders
          .map((cookieHeader) => {
            if (!cookieHeader) return null;
            const cookiePart = cookieHeader.split(";")[0];
            return cookiePart;
          })
          .filter((cookie): cookie is string => cookie !== null);
      }

      if (response.status === 302 && response.headers.location) {
        const cookieString = allCookies.join("; ");

        const redirectResponse = await this.client.get(
          response.headers.location,
          {
            maxRedirects: 0,
            headers: {
              Cookie: cookieString,
            },
          },
        );

        if (redirectResponse.headers["set-cookie"]) {
          const redirectCookies = redirectResponse.headers["set-cookie"]
            .map((cookieHeader) => {
              if (!cookieHeader) return null;
              return cookieHeader.split(";")[0];
            })
            .filter((cookie): cookie is string => cookie !== null);

          allCookies = [...allCookies, ...redirectCookies];
        }
      }

      this.cookies = allCookies.join("; ");
      this.authTimestamp = Date.now();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error as AxiosError,
      };
    }
  }

  public async postSearchCriteria() {
    if (!this.validateAuth()) {
      await this.authenticate();
    }

    const response = await this.client.post(
      "/student/Student/Courses/PostSearchCriteria",
      {},
      {
        headers: {
          Cookie: this.cookies,
        },
      },
    );

    return response.data;
  }

  public clearSession(): void {
    this.cookies = null;
    this.authTimestamp = null;
  }
}
