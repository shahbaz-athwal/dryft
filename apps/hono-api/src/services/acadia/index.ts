import type { AxiosInstance } from "axios";
import { client } from "./axios-client";
import {
  PostSearchCriteriaFilteredResponseSchema,
  type PostSearchCriteriaRequest,
  PostSearchCriteriaRequestSchema,
} from "./schemas/post-search-criteria";
import { SectionDetailsFilteredResponseSchema } from "./schemas/section";
import { StudentProgramDetailsFilteredResponseSchema } from "./schemas/student-program";

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

  private async validateAuth() {
    const expired = Date.now() - (this.authTimestamp ?? 0) > AUTH_TIMEOUT_MS;
    if (!this.cookies || expired) {
      await this.authenticate();
    }
  }

  private async authenticate() {
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
  }

  private async postSearchCriteria(
    searchCriteria?: Partial<PostSearchCriteriaRequest>
  ) {
    await this.validateAuth();

    const defaultCriteria: PostSearchCriteriaRequest = {
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
    return data.subjects;
  }

  async getFacultiesByDepartment(departmentPrefix: string) {
    const data = await this.postSearchCriteria({
      subjects: [departmentPrefix],
    });
    return data.faculties;
  }

  async getAllCourses() {
    const data = await this.postSearchCriteria({ quantityPerPage: 3000 });
    return data.courses;
  }

  async getSectionDetails(courseId: string, sectionIds: string[]) {
    await this.validateAuth();

    const response = await this.client.post(
      "/student/Student/Courses/Sections",
      {
        courseId,
        sectionIds,
      },
      {
        headers: {
          Cookie: this.cookies,
          "Content-Type": "application/json",
        },
      }
    );
    return SectionDetailsFilteredResponseSchema.parse(response.data);
  }

  async getStudentProgramDetails(studentId: string) {
    await this.validateAuth();

    const response = await this.client.get(
      `/student/Student/Grades/GetStudentProgramsInformation?studentId=${studentId}`,
      {
        headers: {
          Cookie: this.cookies,
          Accept: "application/json",
        },
      }
    );

    return StudentProgramDetailsFilteredResponseSchema.parse(response.data);
  }
}

export const scraper = AcadiaScraper.getInstance();
