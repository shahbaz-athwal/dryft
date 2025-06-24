import { RateMyProfScraper } from "../src/rmp-scraper";

const rmp = new RateMyProfScraper();

const response = await rmp.searchSchools("Dal");

// biome-ignore lint: allow console.log
console.log(
  response.newSearch.schools.edges
    .map((edge) => `${edge.node.name}, ${edge.node.city}, ${edge.node.state}`)
    .join("\n"),
);
