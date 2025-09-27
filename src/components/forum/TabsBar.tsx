import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { useUiStore } from "@/store/uiStore";

const tabs = [
  { value: "new", label: "Neu" },
  { value: "top", label: "Top" },
  { value: "active", label: "Aktiv" },
  { value: "unread", label: "Ungelesen" }
] as const;

interface TabsBarProps {
  onChange?: (value: string) => void;
}

const TabsBar = ({ onChange }: TabsBarProps) => {
  const active = useUiStore((state) => state.activeTab);
  const setActive = useUiStore((state) => state.setActiveTab);

  const handleChange = (value: string) => {
    setActive(value as typeof active);
    onChange?.(value);
  };

  return (
    <Tabs value={active} onValueChange={handleChange} className="w-full">
      <TabsList className="relative flex justify-start gap-1.5 rounded-full bg-card/70 p-1.5 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="relative rounded-full px-4 py-2 text-sm font-medium transition data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
          >
            {active === tab.value && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/80 to-secondary/80"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default TabsBar;
