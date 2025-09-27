import type { PropsWithChildren } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SidebarLeftStats from "./SidebarLeftStats";
import SidebarRightTrends from "./SidebarRightTrends";
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
  const density = useUiStore((state) => state.density);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main data-density={density} className="flex-1 pt-4 md:pt-6">
        {children}
      </main>
      <Footer />
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
