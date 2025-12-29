"use client";

import type { ComponentType } from "react";
import { z } from "zod";

import AccountDrawer from "@/components/drawers/account-drawer";
import ProfileDrawer from "@/components/drawers/profile-drawer";
import RatingDrawer from "@/components/drawers/rating-drawer";
import SettingsDrawer from "@/components/drawers/settings-drawer";

const ratingSchema = z.object({
  type: z.enum(["course", "prof"]),
  id: z.string(),
});

type DrawerKey = "profile" | "settings" | "account" | "rating";

type DrawerKeyWithProps = "rating";

type DrawerKeyWithoutProps = Exclude<DrawerKey, DrawerKeyWithProps>;

type DrawerPropsMap = {
  rating: z.infer<typeof ratingSchema>;
};

type DrawerStackItemWithoutProps = {
  [K in DrawerKeyWithoutProps]: { key: K };
}[DrawerKeyWithoutProps];

type DrawerStackItemWithProps = {
  [K in DrawerKeyWithProps]: { key: K; props: DrawerPropsMap[K] };
}[DrawerKeyWithProps];

type DrawerStackItem = DrawerStackItemWithoutProps | DrawerStackItemWithProps;

const DRAWER_REGISTRY: Record<DrawerKey, ComponentType<object>> = {
  profile: ProfileDrawer,
  settings: SettingsDrawer,
  account: AccountDrawer,
  rating: RatingDrawer as ComponentType<object>,
};

const drawerStackSchema = z.array(
  z.union([
    z.object({ key: z.literal("profile") }),
    z.object({ key: z.literal("settings") }),
    z.object({ key: z.literal("account") }),
    z.object({ key: z.literal("rating"), props: ratingSchema }),
  ])
);

function getDrawerComponent<K extends DrawerKey>(
  key: K
): ComponentType<K extends DrawerKeyWithProps ? DrawerPropsMap[K] : object> {
  return DRAWER_REGISTRY[key] as ComponentType<
    K extends DrawerKeyWithProps ? DrawerPropsMap[K] : object
  >;
}

function hasProps(item: DrawerStackItem): item is DrawerStackItemWithProps {
  return "props" in item;
}

export { DRAWER_REGISTRY, drawerStackSchema, getDrawerComponent, hasProps };
export type {
  DrawerKey,
  DrawerKeyWithoutProps,
  DrawerKeyWithProps,
  DrawerPropsMap,
  DrawerStackItem,
};
