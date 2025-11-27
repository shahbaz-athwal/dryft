"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerNested,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { useDrawerStack } from "@/hooks/use-drawer-stack";
import { DRAWER_REGISTRY, type DrawerKey } from "@/lib/drawer-registry";

// Match vaul's internal constants
const NESTED_DISPLACEMENT = 16;
const TRANSITION_DURATION = 0.5;
const TRANSITION_EASE = [0.32, 0.72, 0, 1];

type DrawerComponentProps = {
  onClose: () => void;
  onCloseAll: () => void;
};

type RecursiveDrawerProps = {
  stack: DrawerKey[];
  index: number;
  onCloseAtIndex: (index: number) => void;
  onCloseAll: () => void;
};

type ParentDrawerContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const ParentDrawerContext = createContext<ParentDrawerContextValue | null>(
  null
);

function DrawerLoadingFallback() {
  return (
    <DrawerHeader className="flex items-center justify-center py-12">
      <Spinner />
    </DrawerHeader>
  );
}

function RecursiveDrawer({
  stack,
  index,
  onCloseAtIndex,
  onCloseAll,
}: RecursiveDrawerProps) {
  const currentKey = stack.at(index);
  const [isOpen, setIsOpen] = useState(true);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const parentContext = useContext(ParentDrawerContext);

  // Apply parent scale transform when nested drawer mounts
  // This is needed because vaul's onNestedOpenChange doesn't fire in controlled mode
  useEffect(() => {
    if (index === 0 || !parentContext?.contentRef.current) {
      return;
    }

    const parentElement = parentContext.contentRef.current;
    const scale = (window.innerWidth - NESTED_DISPLACEMENT) / window.innerWidth;
    const translate = -NESTED_DISPLACEMENT;

    parentElement.style.transition = `transform ${TRANSITION_DURATION}s cubic-bezier(${TRANSITION_EASE.join(",")})`;
    parentElement.style.transform = `scale(${scale}) translate3d(${translate}px, 0, 0)`;

    return () => {
      parentElement.style.transition = `transform ${TRANSITION_DURATION}s cubic-bezier(${TRANSITION_EASE.join(",")})`;
      parentElement.style.transform = "";
    };
  }, [index, parentContext]);

  if (!currentKey) {
    return null;
  }

  const CurrentDrawerComponent = DRAWER_REGISTRY[currentKey];
  const hasNext = index + 1 < stack.length;
  const DrawerComponent = index > 0 ? DrawerNested : Drawer;

  const handleAnimationEnd = (open: boolean) => {
    if (!open) {
      onCloseAtIndex(index);
    }
  };

  return (
    <ParentDrawerContext.Provider value={{ contentRef }}>
      <DrawerComponent
        direction="right"
        onAnimationEnd={handleAnimationEnd}
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <DrawerContent
          className="w-[520px] rounded-l-3xl outline-none"
          ref={contentRef}
        >
          <Suspense fallback={<DrawerLoadingFallback />}>
            <CurrentDrawerComponent
              onClose={() => setIsOpen(false)}
              onCloseAll={onCloseAll}
            />
          </Suspense>
          {hasNext && (
            <RecursiveDrawer
              index={index + 1}
              onCloseAll={onCloseAll}
              onCloseAtIndex={onCloseAtIndex}
              stack={stack}
            />
          )}
        </DrawerContent>
      </DrawerComponent>
    </ParentDrawerContext.Provider>
  );
}

function GlobalDrawer() {
  const { stack, closeToIndex, closeAll } = useDrawerStack();

  if (stack.length === 0) {
    return null;
  }

  return (
    <RecursiveDrawer
      index={0}
      onCloseAll={closeAll}
      onCloseAtIndex={closeToIndex}
      stack={stack}
    />
  );
}

export { GlobalDrawer };
export type { DrawerComponentProps };
