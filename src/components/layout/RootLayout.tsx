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
    <div className="flex min-h-screen flex-col leading-relaxed tracking-[0.01em]">
      <Header />
      <div className="flex-1">
        <div
          data-density={density}
          className={cn(
            "mx-auto w-full max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-8 md:py-12"
          )}
        >
          <div
            className={cn(
              "grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_20rem] lg:gap-8",
              density === "compact" && "gap-4 lg:gap-6"
            )}
          >
            <div className="hidden lg:block">
              <SidebarLeftStats />
            </div>
            <div className="min-w-0">
              <div
                className={cn(
                  "space-y-6 md:space-y-8",
                  density === "compact" && "space-y-3 md:space-y-4"
                )}
              >
                {children}
              </div>
            </div>
            <div className="hidden lg:block">
              <SidebarRightTrends />
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ChatDock />

      <Sheet open={sidebarLeftOpen} onOpenChange={(open) => toggleLeft(open)}>
        <SheetContent className="left-0 right-auto w-full max-w-sm border-r">
          <SheetHeader>
            <SheetTitle>Statistiken</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
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
          <div className="mt-6 space-y-4">
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
