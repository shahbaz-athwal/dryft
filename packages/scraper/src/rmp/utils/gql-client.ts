import { GraphQLClient } from "graphql-request";

const RMP_GRAPHQL_URL = "https://www.ratemyprofessors.com/graphql";

const gqlClient = new GraphQLClient(RMP_GRAPHQL_URL, {
  headers: {
    Authorization: "Basic dGVzdDp0ZXN0",
  },
});

export { gqlClient };
