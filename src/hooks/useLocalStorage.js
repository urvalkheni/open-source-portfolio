import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const resolvedValue =
      typeof initialValue === "function" ? initialValue() : initialValue;

    if (typeof window === "undefined") {
      return resolvedValue;
    }

    try {
      const existingValue = window.localStorage.getItem(key);

      if (existingValue !== null) {
        return JSON.parse(existingValue);
      }

      window.localStorage.setItem(key, JSON.stringify(resolvedValue));
    } catch (error) {
      console.error(`Unable to initialize localStorage key "${key}".`, error);
    }

    return resolvedValue;
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Unable to persist localStorage key "${key}".`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
