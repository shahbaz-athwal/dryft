import { Compass } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ExploreFilters } from "@/features/explore/components/explore-filters";
import { ExploreToolbar } from "@/features/explore/components/explore-toolbar";

export default function ExplorePage() {
  return (
    <div className="flex min-h-screen flex-col gap-6 p-6">
      <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="h-[calc(100vh-8rem)] rounded-lg border bg-background">
          <ExploreFilters />
        </aside>
        <section className="flex min-h-[60vh] flex-col gap-4">
          <ExploreToolbar />
          <div className="flex flex-1">
            <Empty className="flex-1">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Compass className="size-4" />
                </EmptyMedia>
                <EmptyTitle>Explore results</EmptyTitle>
                <EmptyDescription>
                  Results will appear here once the data grid is wired up.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                Adjust filters or search to update the URL state.
              </EmptyContent>
            </Empty>
          </div>
        </section>
      </div>
    </div>
  );
}
