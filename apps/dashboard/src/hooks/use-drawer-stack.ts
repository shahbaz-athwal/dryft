"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from "nuqs";

import {
  DRAWER_KEYS,
  type DrawerKey,
  type DrawerKeyWithoutProps,
  type DrawerKeyWithProps,
  type DrawerPropsMap,
  type DrawerStackItem,
  RATING_TYPES,
} from "@/lib/drawer-registry";

type OpenDrawer = {
  <K extends DrawerKeyWithoutProps>(key: K): void;
  <K extends DrawerKeyWithProps>(key: K, props: DrawerPropsMap[K]): void;
};

function useDrawerStack() {
  const [query, setQuery] = useQueryStates(
    {
      drawerKeys: parseAsArrayOf(parseAsStringLiteral(DRAWER_KEYS)).withDefault(
        []
      ),
      ratingType: parseAsStringLiteral(RATING_TYPES),
      ratingId: parseAsString,
    },
    {
      history: "push",
      urlKeys: {
        drawerKeys: "d",
        ratingType: "rt",
        ratingId: "rid",
      },
    }
  );

  // Reconstruct the drawer stack from query parameters
  const stack = query.drawerKeys.map((key) => {
    if (key === "rating" && query.ratingType && query.ratingId) {
      return {
        key: "rating" as const,
        props: {
          type: query.ratingType,
          id: query.ratingId,
        },
      };
    }
    return { key };
  }) as DrawerStackItem[];

  const openDrawer = (<K extends DrawerKey>(
    key: K,
    props?: K extends DrawerKeyWithProps ? DrawerPropsMap[K] : never
  ) => {
    if (key === "rating" && props) {
      // For rating drawer, set both the drawer key and the props
      const ratingProps = props as DrawerPropsMap["rating"];
      setQuery({
        drawerKeys: [...query.drawerKeys, "rating"],
        ratingType: ratingProps.type,
        ratingId: ratingProps.id,
      });
    } else {
      // For simple drawers, just add to the stack
      setQuery({
        drawerKeys: [...query.drawerKeys, key],
      });
    }
  }) as OpenDrawer;

  function pop() {
    if (query.drawerKeys.length === 0) {
      return;
    }

    const newKeys = query.drawerKeys.slice(0, -1);
    const lastKey = query.drawerKeys.at(-1);

    // If we're popping a rating drawer, clear its props
    if (lastKey === "rating") {
      setQuery({
        drawerKeys: newKeys,
        ratingType: null,
        ratingId: null,
      });
    } else {
      setQuery({
        drawerKeys: newKeys,
      });
    }
  }

  function clearStack() {
    setQuery({
      drawerKeys: [],
      ratingType: null,
      ratingId: null,
    });
  }

  return {
    stack,
    openDrawer,
    pop,
    clearStack,
  };
}

export { useDrawerStack };
