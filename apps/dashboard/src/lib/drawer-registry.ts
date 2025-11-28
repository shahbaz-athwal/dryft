"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const DRAWER_LOADERS = {
  profile: () => import("@/components/drawers/profile-drawer"),
  settings: () => import("@/components/drawers/settings-drawer"),
  account: () => import("@/components/drawers/account-drawer"),
} as const;

const DRAWER_REGISTRY = {
  profile: dynamic(DRAWER_LOADERS.profile, { ssr: false }),
  settings: dynamic(DRAWER_LOADERS.settings, { ssr: false }),
  account: dynamic(DRAWER_LOADERS.account, { ssr: false }),
} as const satisfies Record<string, ComponentType>;

type DrawerKey = keyof typeof DRAWER_REGISTRY;

function isValidDrawerKey(key: string): key is DrawerKey {
  return key in DRAWER_REGISTRY;
}

function preloadDrawer(key: DrawerKey) {
  DRAWER_LOADERS[key]();
}

export { DRAWER_REGISTRY, isValidDrawerKey, preloadDrawer };
export type { DrawerKey };
