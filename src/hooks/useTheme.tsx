import { useLocalStorageState } from "ahooks";
import { createContext, PropsWithChildren, useContext, useEffect } from "react";

const ThemeContext = createContext<{
  theme?: string;
  setTheme: (theme: string) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useLocalStorageState<string>("theme", {
    defaultValue: "light",
  });
  useEffect(() => {
    if (theme) {
      document.body.className = theme;
    }
  }, [theme]);
  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (theme) => {
          setTheme(theme);
        },
      }}
    >
      <main
        className={`${theme} bg-background text-foreground w-screen h-screen`}
      >
        {children}
      </main>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
