import type { AxiosError, AxiosInstance } from "axios";
import { client } from "./axios-client";
import {
  type PostSearchCriteriaFilteredResponseInferred,
  PostSearchCriteriaFilteredResponseSchema,
  type PostSearchCriteriaRequestInferred,
  PostSearchCriteriaRequestSchema,
} from "./schemas/post-search-criteria";

type ScraperCredentials = {
  username: string;
  password: string;
};

const AUTH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

class AcadiaScraper {
  private static instance: AcadiaScraper | null = null;
  private readonly client: AxiosInstance;
  private cookies: string | null = null;
  private readonly config: ScraperCredentials;
  private authTimestamp: number | null = null;

  private constructor(config: ScraperCredentials) {
    this.config = config;
    this.client = client;
  }

  static getInstance(): AcadiaScraper {
    if (!process.env.ACADIA_USERNAME) {
      throw new Error("ACADIA_USERNAME is not set");
    }

    if (!process.env.ACADIA_PASSWORD) {
      throw new Error("ACADIA_PASSWORD is not set");
    }

    if (!AcadiaScraper.instance) {
      AcadiaScraper.instance = new AcadiaScraper({
        username: process.env.ACADIA_USERNAME,
        password: process.env.ACADIA_PASSWORD,
      });
    }

    return AcadiaScraper.instance;
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

  private async postSearchCriteria(
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

  async getAllDepartments() {
    const data = await this.postSearchCriteria();
    return data.Subjects.map((subject) => ({
      prefix: subject.Value,
      name: subject.Description,
    }));
  }

  async getFacultiesByDepartment(departmentPrefix: string) {
    const data = await this.postSearchCriteria({
      subjects: [departmentPrefix],
    });
    return data.Faculty.map((faculty) => ({
      id: faculty.Value,
      name: faculty.Description,
    }));
  }

  async getCoursesPage(pageNumber: number) {
    const data = await this.postSearchCriteria({ pageNumber });
    return {
      pagination: {
        totalItems: data.TotalItems,
        totalPages: data.TotalPages,
        nextPage:
          data.CurrentPageIndex < data.TotalPages
            ? data.CurrentPageIndex + 1
            : null,
      },
      courses: data.Courses,
    };
  }
}

export const scraper = AcadiaScraper.getInstance();
