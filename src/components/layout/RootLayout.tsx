import type { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidebarLeftStats from "./SidebarLeftStats";
import SidebarRightTrends from "./SidebarRightTrends";
import ChatDock from "@/components/chat/ChatDock";
import { useUiStore } from "@/store/uiStore";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils/cn";

const RootLayout = ({ children }: PropsWithChildren) => {
  const sidebarLeftOpen = useUiStore((state) => state.sidebarLeftOpen);
  const sidebarRightOpen = useUiStore((state) => state.sidebarRightOpen);
  const toggleLeft = useUiStore((state) => state.toggleSidebarLeft);
  const toggleRight = useUiStore((state) => state.toggleSidebarRight);
  const density = useUiStore((state) => state.density);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 pt-4 md:pt-6">
        <main
          data-density={density}
          className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8 2xl:max-w-[1720px] 2xl:px-10 3xl:max-w-[1880px]"
        >
          <div
            className={cn(
              "grid grid-cols-1 gap-6 items-start lg:grid-cols-[300px_minmax(640px,1fr)_380px] xl:gap-8 2xl:gap-10",
              density === "compact" && "gap-5 xl:gap-6 2xl:gap-8"
            )}
          >
            <aside
              className={cn(
                "sticky top-24 hidden space-y-4 lg:block",
                density === "compact" && "space-y-3"
              )}
              data-density={density}
            >
              <SidebarLeftStats />
            </aside>
            <section
              className={cn(
                "mx-auto w-full max-w-[960px] space-y-6 md:space-y-8 2xl:max-w-[1040px]",
                "lg:col-span-2 xl:col-span-1",
                density === "compact" && "space-y-4 md:space-y-5"
              )}
              data-density={density}
            >
              {children}
            </section>
            <aside
              className={cn(
                "sticky top-24 hidden space-y-4 xl:block w-[340px] xl:w-[360px] 2xl:w-[380px]",
                density === "compact" && "space-y-3"
              )}
              data-density={density}
            >
              <SidebarRightTrends />
            </aside>
          </div>
        </main>
      </div>
      <Footer />
      <div className="fixed bottom-6 right-6 z-40">
        <ChatDock className="w-[360px] 2xl:w-[380px]" />
      </div>

      <Sheet open={sidebarLeftOpen} onOpenChange={(open) => toggleLeft(open)}>
        <SheetContent className="left-0 right-auto w-full max-w-sm border-r">
          <SheetHeader>
            <SheetTitle>Statistiken</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 md:space-y-5">
            <SidebarLeftStats />
            <SheetClose className="mt-4 rounded-md border border-border/60 px-4 py-2 text-sm">
              Schließen
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={sidebarRightOpen} onOpenChange={(open) => toggleRight(open)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Trends &amp; Highlights</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 md:space-y-5">
            <SidebarRightTrends />
            <SheetClose className="mt-4 rounded-md border border-border/60 px-4 py-2 text-sm">
              Schließen
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default RootLayout;
