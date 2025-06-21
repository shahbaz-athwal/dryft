import { useDroppable } from "@dnd-kit/core";
import type React from "react";

export function Droppable({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
