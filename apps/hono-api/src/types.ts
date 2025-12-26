declare global {
  // biome-ignore lint/style/noNamespace: we need this for the prisma json types
  namespace PrismaJson {
    type Requisites = Array<{
      code: string;
      displayText: string;
      displayTextExtension: string;
    }>;
  }
}

// This file must be a module.
export {};
