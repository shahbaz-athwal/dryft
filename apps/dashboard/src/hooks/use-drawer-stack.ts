"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { useCallback } from "react";

import type { DrawerKey } from "@/lib/drawer-registry";
import { isValidDrawerKey } from "@/lib/drawer-registry";

const drawerParser = parseAsArrayOf(parseAsString).withDefault([]);

function useDrawerStack() {
  const [stack, setStack] = useQueryState("drawer", drawerParser);

  const validStack = stack.filter(isValidDrawerKey);

  const open = useCallback(
    (key: DrawerKey) => {
      setStack((prev) => [...prev, key]);
    },
    [setStack]
  );

  const close = useCallback(() => {
    setStack((prev) => {
      if (prev.length === 0) {
        return prev;
      }
      return prev.slice(0, -1);
    });
  }, [setStack]);

  const closeAll = useCallback(() => {
    setStack([]);
  }, [setStack]);

  const replace = useCallback(
    (key: DrawerKey) => {
      setStack((prev) => {
        if (prev.length === 0) {
          return [key];
        }
        return [...prev.slice(0, -1), key];
      });
    },
    [setStack]
  );

  const closeToIndex = useCallback(
    (index: number) => {
      setStack((prev) => prev.slice(0, index));
    },
    [setStack]
  );

  return {
    stack: validStack,
    open,
    close,
    closeAll,
    replace,
    closeToIndex,
  };
}

export { useDrawerStack };
