import { GraphQLClient } from "graphql-request";

// RateMyProfessors GraphQL endpoint
const RMP_GRAPHQL_ENDPOINT = "https://www.ratemyprofessors.com/graphql";

// Create GraphQL client with necessary headers
const client = new GraphQLClient(RMP_GRAPHQL_ENDPOINT, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "application/json",
    "Content-Type": "application/json",
    Referer: "https://www.ratemyprofessors.com/",
    Origin: "https://www.ratemyprofessors.com",
  },
});

export { client };
