"use client";

import { parseAsJson, useQueryState } from "nuqs";

import type {
  DrawerKey,
  DrawerPropsMap,
  DrawerStackItem,
} from "@/lib/drawer-registry";
import { drawerStackSchema, preloadDrawer } from "@/lib/drawer-registry";

const drawerParser = parseAsJson(drawerStackSchema).withDefault([]);

const closeRegistry = new Map<number, () => void>();

function useDrawerStack() {
  const [stack, setStack] = useQueryState("drawer", drawerParser);

  const validStack = stack ?? [];

  function openDrawer<K extends DrawerKey>(key: K, props: DrawerPropsMap[K]) {
    setStack((prev) => [...(prev ?? []), { key, props } as DrawerStackItem]);
  }

  function pop() {
    setStack((prev) => {
      const current = prev ?? [];
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
      await new Promise((resolve) => setTimeout(resolve, 100));
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
