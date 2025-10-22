import type { GraphQLClient } from "graphql-request";
import { COURSES_BY_PROFESSOR_QUERY } from "./queries/courses-by-prof-id";
import {
  SCHOOL_DEPARTMENTS_QUERY,
  SchoolDepartmentsResponseSchema,
} from "./queries/departments-by-school";
import { SEARCH_SCHOOL_QUERY } from "./queries/search-school-query";
import { SchoolSearchResponseSchema } from "./schemas/school-search-response";
import { gqlClient } from "./utils/gql-client";

export class RateMyProfScraper {
  private readonly client: GraphQLClient;

  constructor() {
    this.client = gqlClient;
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
}
