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

const RootLayout = ({ children }: PropsWithChildren) => {
  const sidebarLeftOpen = useUiStore((state) => state.sidebarLeftOpen);
  const sidebarRightOpen = useUiStore((state) => state.sidebarRightOpen);
  const toggleLeft = useUiStore((state) => state.toggleSidebarLeft);
  const toggleRight = useUiStore((state) => state.toggleSidebarRight);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
          <div className="hidden lg:block">
            <SidebarLeftStats />
          </div>
          <div className="min-w-0">{children}</div>
          <div className="hidden lg:block">
            <SidebarRightTrends />
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
