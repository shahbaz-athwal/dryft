"use client";

import dynamic from "next/dynamic";
import { z } from "zod";

// Props schemas for each drawer
const drawerPropsSchemas = {
  profile: z.object({}),
  settings: z.object({}),
  account: z.object({}),
  rating: z.object({
    type: z.enum(["course", "prof"]),
    id: z.string(),
  }),
} as const;

// Zod schema for drawer stack items (discriminated union)
const drawerStackItemSchema = z.discriminatedUnion("key", [
  z.object({ key: z.literal("profile"), props: drawerPropsSchemas.profile }),
  z.object({ key: z.literal("settings"), props: drawerPropsSchemas.settings }),
  z.object({ key: z.literal("account"), props: drawerPropsSchemas.account }),
  z.object({ key: z.literal("rating"), props: drawerPropsSchemas.rating }),
]);

const drawerStackSchema = z.array(drawerStackItemSchema);

// Derive types from schemas
type DrawerPropsMap = {
  [K in keyof typeof drawerPropsSchemas]: z.infer<
    (typeof drawerPropsSchemas)[K]
  >;
};

type DrawerKey = keyof DrawerPropsMap;

type DrawerStackItem = z.infer<typeof drawerStackItemSchema>;

const DRAWER_LOADERS = {
  profile: () => import("@/components/drawers/profile-drawer"),
  settings: () => import("@/components/drawers/settings-drawer"),
  account: () => import("@/components/drawers/account-drawer"),
  rating: () => import("@/components/drawers/rating-drawer"),
} as const;

const DRAWER_REGISTRY = {
  profile: dynamic(DRAWER_LOADERS.profile, { ssr: false }),
  settings: dynamic(DRAWER_LOADERS.settings, { ssr: false }),
  account: dynamic(DRAWER_LOADERS.account, { ssr: false }),
  rating: dynamic(DRAWER_LOADERS.rating, { ssr: false }),
} as const;

function isValidDrawerKey(key: unknown): key is DrawerKey {
  return typeof key === "string" && key in DRAWER_REGISTRY;
}

function isValidDrawerStackItem(item: unknown): item is DrawerStackItem {
  return (
    typeof item === "object" &&
    item !== null &&
    "key" in item &&
    "props" in item &&
    isValidDrawerKey((item as { key: unknown }).key)
  );
}

function preloadDrawer(key: DrawerKey) {
  DRAWER_LOADERS[key]();
}

export {
  DRAWER_REGISTRY,
  drawerStackSchema,
  isValidDrawerKey,
  isValidDrawerStackItem,
  preloadDrawer,
};
export type { DrawerKey, DrawerPropsMap, DrawerStackItem };
