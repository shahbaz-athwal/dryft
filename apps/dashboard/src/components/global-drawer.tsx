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

const NESTED_DISPLACEMENT = 16;
const TRANSITION_DURATION = 0.5;
const TRANSITION_EASE = [0.32, 0.72, 0, 1];

type DrawerComponentProps = {
  onClose: () => void;
  onCloseAll: () => void;
};

type ParentDrawerContextValue = {
  contentRef: React.RefObject<HTMLDivElement | null>;
};

const ParentDrawerContext = createContext<ParentDrawerContextValue | null>(
  null
);

type RecursiveDrawerProps = {
  stack: DrawerKey[];
  index: number;
  onCloseAtIndex: (index: number) => void;
  onCloseAll: () => void;
};

function DrawerLoadingFallback() {
  return (
    <DrawerHeader className="flex items-center justify-center py-12">
      <Spinner />
    </DrawerHeader>
  );
}

function applyNestedTransform(
  element: HTMLElement,
  isOpen: boolean,
  direction: "left" | "right" | "top" | "bottom"
) {
  const isVertical = direction === "top" || direction === "bottom";
  const dim = isVertical ? window.innerHeight : window.innerWidth;
  const scale = isOpen ? (dim - NESTED_DISPLACEMENT) / dim : 1;
  const translate = isOpen ? -NESTED_DISPLACEMENT : 0;

  element.style.transition = `transform ${TRANSITION_DURATION}s cubic-bezier(${TRANSITION_EASE.join(",")})`;

  if (isVertical) {
    element.style.transform = `scale(${scale}) translate3d(0, ${translate}px, 0)`;
  } else {
    element.style.transform = `scale(${scale}) translate3d(${translate}px, 0, 0)`;
  }
}

function RecursiveDrawer({
  stack,
  index,
  onCloseAtIndex,
  onCloseAll,
}: RecursiveDrawerProps) {
  const currentKey = stack.at(index);
  const [prevKey, setPrevKey] = useState(currentKey);
  const [isOpen, setIsOpen] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const hasClosedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const parentContext = useContext(ParentDrawerContext);

  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setIsOpen(true);
    setIsClosing(false);
    hasClosedRef.current = false;
  }

  // Apply parent scale transform when nested drawer mounts
  useEffect(() => {
    if (index === 0 || !parentContext?.contentRef.current) {
      return;
    }

    const parentElement = parentContext.contentRef.current;

    // Apply the scale transform to parent
    applyNestedTransform(parentElement, true, "right");

    // Cleanup: reset parent transform when unmounting
    return () => {
      applyNestedTransform(parentElement, false, "right");
    };
  }, [index, parentContext]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!currentKey) {
    return null;
  }

  const CurrentDrawerComponent = DRAWER_REGISTRY[currentKey];
  const hasNext = index + 1 < stack.length;
  const isNested = index > 0;

  const performClose = () => {
    if (hasClosedRef.current) {
      return;
    }
    hasClosedRef.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onCloseAtIndex(index);
  };

  const handleOpenChange = (open: boolean) => {
    if (open || isClosing) {
      return;
    }
    setIsClosing(true);
    setIsOpen(false);

    timeoutRef.current = setTimeout(performClose, 200);
  };

  const handleAnimationEnd = (open: boolean) => {
    if (open || !isClosing) {
      return;
    }
    performClose();
  };

  const handleClose = () => {
    if (isClosing) {
      return;
    }
    setIsClosing(true);
    setIsOpen(false);
  };

  const DrawerComponent = isNested ? DrawerNested : Drawer;

  return (
    <ParentDrawerContext.Provider value={{ contentRef }}>
      <DrawerComponent
        direction="right"
        onAnimationEnd={handleAnimationEnd}
        onOpenChange={handleOpenChange}
        open={isOpen}
      >
        <DrawerContent
          className="w-[400px] rounded-l-3xl outline-none"
          ref={contentRef}
        >
          <Suspense fallback={<DrawerLoadingFallback />}>
            <CurrentDrawerComponent
              onClose={handleClose}
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
