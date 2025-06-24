import { SchoolSearchResponseSchema } from "@repo/schema/gql/school-search-response";
import type { GraphQLClient } from "graphql-request";
import { SEARCH_SCHOOL_QUERY } from "./queries/search-school-query";
import { gqlClient } from "./utils/rmp-gql-client";

export class RateMyProfScraper {
  private client: GraphQLClient;

  constructor() {
    this.client = gqlClient;
  }

  private async executeQuery(query: string, variables: Record<string, any>) {
    const response = await this.client.request(query, variables);
    return response;
  }

  public async searchSchools(keyword: string) {
    const query = SEARCH_SCHOOL_QUERY;
    const variables = { query: { text: keyword } };
    const response = await this.executeQuery(query, variables);

    return SchoolSearchResponseSchema.parse(response);
  }
}
