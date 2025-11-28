"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

const DRAWER_REGISTRY = {
  profile: dynamic(() => import("@/components/drawers/profile-drawer"), {
    ssr: false,
  }),
  settings: dynamic(() => import("@/components/drawers/settings-drawer"), {
    ssr: false,
  }),
  account: dynamic(() => import("@/components/drawers/account-drawer"), {
    ssr: false,
  }),
} as const satisfies Record<string, ComponentType>;

type DrawerKey = keyof typeof DRAWER_REGISTRY;

function isValidDrawerKey(key: string): key is DrawerKey {
  return key in DRAWER_REGISTRY;
}

export { DRAWER_REGISTRY, isValidDrawerKey };
export type { DrawerKey };
