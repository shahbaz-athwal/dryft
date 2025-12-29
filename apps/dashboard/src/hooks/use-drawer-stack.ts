"use client";

import { parseAsJson, useQueryState } from "nuqs";

import type {
  DrawerKey,
  DrawerKeyWithoutProps,
  DrawerKeyWithProps,
  DrawerPropsMap,
  DrawerStackItem,
} from "@/lib/drawer-registry";
import { drawerStackSchema, preloadDrawer } from "@/lib/drawer-registry";

const drawerParser = parseAsJson(drawerStackSchema).withDefault([]);

type OpenDrawer = {
  <K extends DrawerKeyWithoutProps>(key: K): void;
  <K extends DrawerKeyWithProps>(key: K, props: DrawerPropsMap[K]): void;
};

function useDrawerStack() {
  const [stack, setStack] = useQueryState("drawer", drawerParser);

  const validStack = (stack ?? []) as DrawerStackItem[];

  const openDrawer = (<K extends DrawerKey>(
    key: K,
    props?: K extends DrawerKeyWithProps ? DrawerPropsMap[K] : never
  ) => {
    const item = props !== undefined ? { key, props } : { key };
    setStack((prev) => [
      ...((prev ?? []) as DrawerStackItem[]),
      item as DrawerStackItem,
    ]);
  }) as OpenDrawer;

  function pop() {
    setStack((prev) => {
      const current = (prev ?? []) as DrawerStackItem[];
      if (current.length === 0) {
        return current;
      }
      return current.slice(0, -1);
    });
  }

  function clearStack() {
    setStack([]);
  }

  function loadDrawer(key: DrawerKey) {
    preloadDrawer(key);
  }

  return {
    stack: validStack,
    openDrawer,
    pop,
    clearStack,
    loadDrawer,
  };
}

export { useDrawerStack };
