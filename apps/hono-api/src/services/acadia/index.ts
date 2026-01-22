import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { client as defaultClient } from "./axios-client";
import {
  PostSearchCriteriaFilteredResponseSchema,
  type PostSearchCriteriaRequest,
  PostSearchCriteriaRequestSchema,
} from "./schemas/post-search-criteria";
import { SectionDetailsFilteredResponseSchema } from "./schemas/section";
import { StudentGradesFilteredResponseSchema } from "./schemas/student-grades";
import { StudentProgramDetailsFilteredResponseSchema } from "./schemas/student-program";

type ScraperCredentials = {
  username: string;
  password: string;
};

const AUTH_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export class AcadiaService {
  private readonly client: AxiosInstance;
  private cookies: string | null = null;
  private readonly config: ScraperCredentials;
  private authTimestamp: number | null = null;
  private authPromise: Promise<void> | null = null;

  constructor(
    config: ScraperCredentials,
    client: AxiosInstance = defaultClient
  ) {
    this.config = config;
    this.client = client;
    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig & { _retry?: boolean }) => {
        // Skip auth for internal auth requests (marked by _retry flag or explicit header)
        if (config._retry || config.headers?.has("x-skip-auth")) {
          return config;
        }

        // Skip auth check for login endpoints to avoid infinite loops
        if (config.url?.includes("/student/Account/Login")) {
          return config;
        }

        // Default Accept header for all API requests
        config.headers.set("Accept", "application/json");

        const authExpired =
          Date.now() - (this.authTimestamp ?? 0) > AUTH_TIMEOUT_MS;

        if (authExpired) {
          if (!this.authPromise) {
            this.authPromise = this.authenticate().finally(() => {
              this.authPromise = null;
            });
          }
          await this.authPromise;
        }

        if (this.cookies && config.headers) {
          config.headers.set("Cookie", this.cookies);
        }

        return config;
      }
    );
  }

  private async authenticate() {
    const formData = new URLSearchParams();
    formData.append("UserName", this.config.username);
    formData.append("Password", this.config.password);

    // Axios automatically sets Content-Type: application/x-www-form-urlencoded
    // when using URLSearchParams
    const response = await this.client.post(
      "/student/Account/Login",
      formData,
      {
        maxRedirects: 0,
        headers: {
          "x-skip-auth": "true",
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
            "x-skip-auth": "true",
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
      validatedCriteria
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
    const response = await this.client.post(
      "/student/Student/Courses/Sections",
      {
        courseId,
        sectionIds,
      }
    );
    return SectionDetailsFilteredResponseSchema.parse(response.data);
  }

  async getStudentProgramDetails(studentId: string) {
    const response = await this.client.get(
      `/student/Student/Grades/GetStudentProgramsInformation?studentId=${studentId}`
    );

    return StudentProgramDetailsFilteredResponseSchema.parse(response.data);
  }

  async getStudentGrades(studentId: string) {
    const response = await this.client.get(
      `/student/Student/Grades/GetStudentGradeInformation?studentId=${studentId}`
    );

    return StudentGradesFilteredResponseSchema.parse(response.data);
  }
}

function createScraperInstance() {
  if (!process.env.ACADIA_USERNAME) {
    throw new Error("ACADIA_USERNAME is not set");
  }

  if (!process.env.ACADIA_PASSWORD) {
    throw new Error("ACADIA_PASSWORD is not set");
  }

  return new AcadiaService({
    username: process.env.ACADIA_USERNAME,
    password: process.env.ACADIA_PASSWORD,
  });
}

export const scraper = createScraperInstance();
