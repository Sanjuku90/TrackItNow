import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="bg-slate-700 hover:bg-slate-600 border-slate-600"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-slate-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-300" />
      )}
    </Button>
  );
}
