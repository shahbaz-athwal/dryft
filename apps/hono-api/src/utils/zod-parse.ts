import { z } from "zod";

// Transform string such as "{ lastFundraiseDate: string, amount: string, round: string }" into a zod schema
export function stringToZodSchema(schema: string) {
  // Remove whitespace and curly braces
  const trimmed = schema.replace(/\s/g, "").slice(1, -1);

  // Split into individual field definitions
  const fields = trimmed.split(",");

  // Build object shape
  const shape: Record<string, z.ZodType> = {};

  for (const field of fields) {
    const [key, type] = field.split(":");

    // Check if type is an array (ends with [])
    const isArray = type?.endsWith("[]");
    const baseType = isArray ? type?.slice(0, -2) : type;

    let zodType: z.ZodType;
    switch (baseType) {
      case "string":
        zodType = z.string();
        break;
      case "number":
        zodType = z.number();
        break;
      case "boolean":
        zodType = z.boolean();
        break;
      case "date":
        zodType = z.date();
        break;
      default:
        zodType = z.string(); // Default to string for unknown types
    }

    // Wrap in array if needed
    shape[key as string] = isArray ? z.array(zodType) : zodType;
  }

  return z.object(shape);
}
