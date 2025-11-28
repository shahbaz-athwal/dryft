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
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerNested,
} from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { registerDrawerClose, useDrawerStack } from "@/hooks/use-drawer-stack";
import { DRAWER_REGISTRY, type DrawerKey } from "@/lib/drawer-registry";

// Match vaul's internal constants
const NESTED_DISPLACEMENT = 16;
const TRANSITION_DURATION = 0.5;
const TRANSITION_EASE = [0.32, 0.72, 0, 1];

type RecursiveDrawerProps = {
  stack: DrawerKey[];
  index: number;
};

function DrawerLoadingFallback() {
  return (
    <DrawerHeader className="flex items-center justify-center py-12">
      <Spinner />
    </DrawerHeader>
  );
}

const ParentDrawerContext = createContext<{
  contentRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

function RecursiveDrawer({ stack, index }: RecursiveDrawerProps) {
  const currentKey = stack.at(index);

  const [isOpen, setIsOpen] = useState(true);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const parentContext = useContext(ParentDrawerContext);
  const { pop } = useDrawerStack();

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

  // Click the hidden DrawerClose button to trigger vaul's native close
  useEffect(() => {
    return registerDrawerClose(index, () => {
      closeButtonRef.current?.click();
    });
  });

  if (!currentKey) {
    return null;
  }

  const CurrentDrawerComponent = DRAWER_REGISTRY[currentKey];
  const hasNext = index + 1 < stack.length;
  const DrawerComponent = index > 0 ? DrawerNested : Drawer;

  return (
    <ParentDrawerContext.Provider value={{ contentRef }}>
      <DrawerComponent
        direction="right"
        onAnimationEnd={(open: boolean) => {
          if (!open) {
            pop();
          }
        }}
        onOpenChange={setIsOpen}
        open={isOpen}
      >
        <DrawerContent
          className="w-[520px] rounded-l-3xl outline-none"
          ref={contentRef}
        >
          {/* Hidden close button for programmatic close */}
          <DrawerClose className="sr-only" ref={closeButtonRef}>
            Close
          </DrawerClose>
          <Suspense fallback={<DrawerLoadingFallback />}>
            <CurrentDrawerComponent />
          </Suspense>
          {hasNext && <RecursiveDrawer index={index + 1} stack={stack} />}
        </DrawerContent>
      </DrawerComponent>
    </ParentDrawerContext.Provider>
  );
}

function GlobalDrawer() {
  const { stack } = useDrawerStack();

  if (stack.length === 0) {
    return null;
  }

  return <RecursiveDrawer index={0} stack={stack} />;
}

export { GlobalDrawer };
