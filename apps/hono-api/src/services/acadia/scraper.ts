import { AcadiaService } from "./acadia-service";

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
