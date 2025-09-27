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
      <TabsList className="relative flex justify-start gap-1 bg-transparent">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="relative px-4 py-2">
            {active === tab.value && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute inset-x-0 bottom-0 h-1 rounded-full bg-gradient-to-r from-primary to-secondary"
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
