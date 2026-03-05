import { useState, useEffect } from "react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  return <button onClick={() => setDark(!dark)}>Toggle Theme</button>;
};

export default ThemeToggle;