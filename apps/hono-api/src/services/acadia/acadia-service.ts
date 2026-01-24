import type { AxiosInstance } from "axios";
import { authenticateWithAxios } from "./auth";
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
    this.client.interceptors.request.use(async (config) => {
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

      if (this.cookies) {
        config.headers.set("Cookie", this.cookies);
      }

      return config;
    });
  }

  private async authenticate() {
    this.cookies = await authenticateWithAxios(
      this.config.username,
      this.config.password
    );
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
