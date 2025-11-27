"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

import type { DrawerComponentProps } from "@/components/global-drawer";

const DRAWER_REGISTRY = {
  profile: dynamic(() => import("@/components/drawers/profile-drawer")),
  settings: dynamic(() => import("@/components/drawers/settings-drawer")),
  account: dynamic(() => import("@/components/drawers/account-drawer")),
} as const satisfies Record<string, ComponentType<DrawerComponentProps>>;

type DrawerKey = keyof typeof DRAWER_REGISTRY;

function isValidDrawerKey(key: string): key is DrawerKey {
  return key in DRAWER_REGISTRY;
}

export { DRAWER_REGISTRY, isValidDrawerKey };
export type { DrawerKey };
