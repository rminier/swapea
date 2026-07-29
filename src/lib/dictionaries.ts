import "server-only";

const dictionaries = {
  en: () => import("@/locales/en.json").then((module) => module.default),
  es: () => import("@/locales/es.json").then((module) => module.default),
};

export type Locale = "en" | "es";

export const getDictionary = async (locale: Locale) => {
  return (dictionaries[locale] || dictionaries.en)();
};
