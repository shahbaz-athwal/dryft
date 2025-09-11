import {
  type PostSearchCriteriaFilteredResponseInferred,
  PostSearchCriteriaFilteredResponseSchema,
  type PostSearchCriteriaRequestInferred,
  PostSearchCriteriaRequestSchema,
} from "@repo/schema/post-search-criteria";
import type { AxiosError, AxiosInstance } from "axios";
import { client } from "./utils/axios";

type ScraperCredentials = {
  username: string;
  password: string;
};

const AUTH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export class AcadiaScraper {
  private readonly client: AxiosInstance;
  private cookies: string | null = null;
  private readonly config: ScraperCredentials;
  private authTimestamp: number | null = null;

  constructor(config: ScraperCredentials) {
    this.config = config;
    this.client = client;
  }

  private validateAuth(): boolean {
    if (!(this.cookies && this.authTimestamp)) {
      return false;
    }

    const now = Date.now();
    return now - this.authTimestamp < AUTH_TIMEOUT_MS;
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
        }
      );

      const setCookieHeaders = response.headers["set-cookie"];
      let allCookies: string[] = [];

      if (setCookieHeaders) {
        allCookies = setCookieHeaders
          .map((cookieHeader) => {
            if (!cookieHeader) {
              return null;
            }
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
          }
        );

        if (redirectResponse.headers["set-cookie"]) {
          const redirectCookies = redirectResponse.headers["set-cookie"]
            .map((cookieHeader) => {
              if (!cookieHeader) {
                return null;
              }
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

  async postSearchCriteria(
    searchCriteria?: Partial<PostSearchCriteriaRequestInferred>
  ): Promise<PostSearchCriteriaFilteredResponseInferred> {
    if (!this.validateAuth()) {
      await this.authenticate();
    }

    // Validate and set default values for search criteria
    const defaultCriteria: PostSearchCriteriaRequestInferred = {
      keyword: null,
      terms: [],
      courseIds: null,
      sectionIds: null,
      subjects: [],
      faculty: [],
      pageNumber: 1,
      quantityPerPage: 30,
    };

    const validatedCriteria = PostSearchCriteriaRequestSchema.parse({
      ...defaultCriteria,
      ...searchCriteria,
    });

    const response = await this.client.post(
      "/student/Student/Courses/PostSearchCriteria",
      validatedCriteria,
      {
        headers: {
          Cookie: this.cookies,
          "Content-Type": "application/json",
        },
      }
    );

    return PostSearchCriteriaFilteredResponseSchema.parse(response.data);
  }

  clearSession(): void {
    this.cookies = null;
    this.authTimestamp = null;
  }
}
