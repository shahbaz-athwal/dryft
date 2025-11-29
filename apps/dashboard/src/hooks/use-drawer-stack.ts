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

const closeRegistry = new Map<number, () => void>();

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

  async function closeAllDrawers() {
    // Get all indices and sort in descending order (close from inside-out)
    const indices = Array.from(closeRegistry.keys()).sort((a, b) => b - a);
    for (const index of indices) {
      const fn = closeRegistry.get(index);
      fn?.();
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    setStack([]);
  }

  function closeTopDrawer() {
    const topIndex = validStack.length - 1;
    if (topIndex < 0) {
      return;
    }
    closeRegistry.get(topIndex)?.();
  }

  function loadDrawer(key: DrawerKey) {
    preloadDrawer(key);
  }

  return {
    stack: validStack,
    openDrawer,
    pop,
    closeTopDrawer,
    closeAllDrawers,
    loadDrawer,
  };
}

function registerDrawerClose(index: number, closeFn: () => void) {
  closeRegistry.set(index, closeFn);
  return () => {
    closeRegistry.delete(index);
  };
}

export { registerDrawerClose, useDrawerStack };
