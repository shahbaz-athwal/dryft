import type { GraphQLClient } from "graphql-request";
import { gqlClient } from "./gql-client";
import { COURSES_BY_PROFESSOR_QUERY } from "./queries/courses-by-prof-id";
import {
  SCHOOL_DEPARTMENTS_QUERY,
  SchoolDepartmentsResponseSchema,
} from "./queries/departments-by-school";
import {
  SchoolSearchResponseSchema,
  SEARCH_SCHOOL_QUERY,
} from "./queries/search-school-query";
import {
  TEACHER_RATINGS_PAGE_QUERY,
  TeacherRatingsResponseSchema,
} from "./queries/teacher-rating-page";
import {
  TEACHER_SEARCH_QUERY,
  TeacherSearchResponseSchema,
} from "./queries/teacher-search-query";

export class RateMyProfScraper {
  private static instance: RateMyProfScraper | null = null;
  private readonly client: GraphQLClient;

  private constructor() {
    this.client = gqlClient;
  }

  static getInstance(): RateMyProfScraper {
    if (!RateMyProfScraper.instance) {
      RateMyProfScraper.instance = new RateMyProfScraper();
    }

    return RateMyProfScraper.instance;
  }

  private async executeQuery(
    query: string,
    variables: Record<string, unknown>
  ) {
    const response = await this.client.request(query, variables);
    return response;
  }

  async coursesByProfessorId(professorId: string) {
    const query = COURSES_BY_PROFESSOR_QUERY;
    const variables = { professorId };
    const response = await this.executeQuery(query, variables);
    return response;
  }

  async searchSchools(keyword: string) {
    const query = SEARCH_SCHOOL_QUERY;
    const variables = { query: { text: keyword } };
    const response = await this.executeQuery(query, variables);

    return SchoolSearchResponseSchema.parse(response);
  }

  async getDepartmentbySchoolId(schoolId: string) {
    const query = SCHOOL_DEPARTMENTS_QUERY;
    const variables = { schoolId };
    const response = await this.executeQuery(query, variables);
    return SchoolDepartmentsResponseSchema.parse(response).search.teachers
      .filters[0]?.options;
  }

  async searchTeachersBySchoolId(schoolId: string) {
    const query = TEACHER_SEARCH_QUERY;
    const variables = {
      count: 1000,
      query: {
        text: "",
        schoolID: schoolId,
        fallback: true,
      },
    };
    const response = await this.executeQuery(query, variables);
    const parsed = TeacherSearchResponseSchema.parse(response);
    return parsed.search.teachers.edges.map((edge) => edge.node);
  }

  async getTeacherRatings({
    teacherId,
    cursor,
  }: {
    teacherId: string;
    cursor?: string;
  }) {
    const query = TEACHER_RATINGS_PAGE_QUERY;
    const variables = { id: teacherId, cursor };
    const response = await this.executeQuery(query, variables);
    const parsed = TeacherRatingsResponseSchema.parse(response);

    return {
      ratings: parsed.node.ratings.edges.map((edge) => edge.node),
      paging: parsed.node.ratings.pageInfo,
    };
  }
}

export const scraper = RateMyProfScraper.getInstance();
