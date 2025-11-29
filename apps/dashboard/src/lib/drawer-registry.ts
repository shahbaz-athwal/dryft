"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { z } from "zod";

const drawerConfig = {
  profile: {
    loader: () => import("@/components/drawers/profile-drawer"),
  },
  settings: {
    loader: () => import("@/components/drawers/settings-drawer"),
  },
  account: {
    loader: () => import("@/components/drawers/account-drawer"),
  },
  rating: {
    loader: () => import("@/components/drawers/rating-drawer"),
    schema: z.object({
      type: z.enum(["course", "prof"]),
      id: z.string(),
    }),
  },
} as const;

type DrawerConfig = typeof drawerConfig;

type DrawerKey = keyof DrawerConfig;

type DrawerKeyWithProps = {
  [K in DrawerKey]: DrawerConfig[K] extends { schema: z.ZodType } ? K : never;
}[DrawerKey];

type DrawerKeyWithoutProps = Exclude<DrawerKey, DrawerKeyWithProps>;

type DrawerPropsMap = {
  [K in DrawerKeyWithProps]: DrawerConfig[K] extends { schema: z.ZodType }
    ? z.infer<DrawerConfig[K]["schema"]>
    : never;
};

type DrawerStackItemWithoutProps = {
  [K in DrawerKeyWithoutProps]: { key: K };
}[DrawerKeyWithoutProps];

type DrawerStackItemWithProps = {
  [K in DrawerKeyWithProps]: { key: K; props: DrawerPropsMap[K] };
}[DrawerKeyWithProps];

type DrawerStackItem = DrawerStackItemWithoutProps | DrawerStackItemWithProps;

const drawerKeys = Object.keys(drawerConfig) as DrawerKey[];

const DRAWER_REGISTRY = Object.fromEntries(
  drawerKeys.map((key) => [
    key,
    dynamic(drawerConfig[key].loader, { ssr: false }),
  ])
) as {
  [K in DrawerKey]: ComponentType<
    K extends DrawerKeyWithProps ? DrawerPropsMap[K] : object
  >;
};

function buildStackSchema() {
  const itemSchemas = drawerKeys.map((key) => {
    const config = drawerConfig[key];
    if ("schema" in config) {
      return z.object({ key: z.literal(key), props: config.schema });
    }
    return z.object({ key: z.literal(key) });
  });

  return z.array(z.union(itemSchemas));
}

const drawerStackSchema = buildStackSchema();

function preloadDrawer(key: DrawerKey) {
  drawerConfig[key].loader();
}

function getDrawerComponent<K extends DrawerKey>(
  key: K
): ComponentType<K extends DrawerKeyWithProps ? DrawerPropsMap[K] : object> {
  return DRAWER_REGISTRY[key];
}

function hasProps(item: DrawerStackItem): item is DrawerStackItemWithProps {
  return "props" in item;
}

export {
  DRAWER_REGISTRY,
  drawerStackSchema,
  getDrawerComponent,
  hasProps,
  preloadDrawer,
};
export type {
  DrawerKey,
  DrawerKeyWithoutProps,
  DrawerKeyWithProps,
  DrawerPropsMap,
  DrawerStackItem,
};
