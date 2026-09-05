"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { AllergenKey, FoodCategory, FoodPreference } from "@/types/food";

export type Locale = "en" | "fr";

const STORAGE_KEY = "pierre-tracker-lang";

export const LOCALE_TAGS: Record<Locale, string> = {
  en: "en-US",
  fr: "fr-FR",
};

const en = {
  header: {
    appName: "Pierre Tracker",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    edit: "Edit",
    loading: "Loading…",
    saving: "Saving…",
    optional: "optional",
    failedToLoad: "Failed to load",
    failedToLoadData: "Failed to load data",
    failedToSave: "Failed to save",
  },
  languageToggle: {
    switchTo: "Passer en français",
    targetCode: "FR",
  },
  theme: {
    useNightSchedule: "Use night schedule",
    theme: "Theme",
    switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode",
    darkScheduled: "Dark (scheduled). Click for light.",
    lightScheduled: "Light (scheduled). Click for dark.",
    darkOn: "Dark mode on. Click for light.",
    lightOn: "Light mode on. Click for dark.",
    light: "Light",
    dark: "Dark",
  },
  logger: {
    logActivity: "LOG ACTIVITY",
    cancel: "CANCEL",
    cancelAria: "Cancel",
    dateLabel: "DATE:",
    timeLabel: "TIME:",
    eventDate: "Event date",
    eventTime: "Event time",
    backdateNotice: "Logging for a past date",
    feedingType: "Feeding type",
    bottle: "Bottle",
    solids: "Solids",
    feedAmount: "Feed amount",
    decreaseAmount: "Decrease amount",
    increaseAmount: "Increase amount",
    logFeed: "Log Feed",
    wet: "Wet",
    dirty: "Dirty",
    alreadyAdded: "Already added",
    addAtLeastOneFood: "Add at least one food",
    failedToLogFoods: "Failed to log foods",
    logFoods: (count: number) =>
      count === 1 ? "Log 1 food" : count > 1 ? `Log ${count} foods` : "Log foods",
    howDidItGo: (food: string) => `How did ${food} go?`,
    whatDidHeEat: "What did he eat?",
    addAnotherFood: "Add another food",
    foodPlaceholder: "e.g. Avocado, Salmon, Peanut Butter",
    foodName: "Food name",
    addFood: (name: string) => `Add “${name}”`,
    addFoodsHint: "Add foods one by one. Rating is optional.",
    removeFood: (name: string) => `Remove ${name}`,
    commentOptional: "Comment (optional)",
    commentPlaceholder: "Texture, gagging, pairings…",
  },
  summary: {
    title: "Today's Summary",
    lastFeed: "Last Feed",
    fedToday: "Fed Today",
    sleptToday: "Slept Today",
    diapersToday: "Diapers Today",
    diaperUnit: "chgs",
    sleepUnitFallback: "hrs",
  },
  timeline: {
    title: "Recent Activity",
    empty: "No recent events",
    viewMore: "View More",
    deleteActivity: "Delete activity",
    failedToDelete: "Failed to delete activity",
    solidFood: "Solid Food",
    feed: "Feed",
    sleep: "Sleep",
    diaper: "Diaper",
    reaction: "Reaction",
  },
  passport: {
    milestoneTracker: "Milestone Tracker",
    title: "Pierre's Food Passport",
    empty: "No solids logged yet — tap Log Activity → Solids to start.",
    foodsIntroduced: (n: number) =>
      `${n} food${n === 1 ? "" : "s"} introduced`,
    allergensPassed: (n: number) =>
      `${n} top allergen${n === 1 ? "" : "s"} passed`,
    foodsExplored: (n: number) => `${n} food${n === 1 ? "" : "s"} explored`,
    foodCount: (n: number) => `${n} food${n === 1 ? "" : "s"}`,
    explore: "Explore Passport ›",
    tried: "Tried:",
    triedOn: (date: string) => `Tried ${date}`,
    reactionBadge: "(!) Reaction",
    exploreEmpty:
      "No foods yet. Log a solid from Activity Logger to fill the passport.",
    failedToLoadPassport: "Failed to load passport",
    backToHistory: "← Back to history",
    backToPassport: "← Back to passport",
    editSolidEntry: "Edit solid entry",
    food: "Food",
    foodDetail: "Food detail",
    category: "Category",
    foodCategory: "Food category",
    failedToUpdateCategory: "Failed to update category",
    failedToLoadFood: "Failed to load food",
    noExposures: "No exposures yet.",
    unrated: "Unrated",
    reactionPrefix: "Reaction:",
    reactionLogged: "Logged",
    reportReaction: "Report reaction",
    editComment: "Edit comment",
    addComment: "Add comment",
    reactionNotes: "Reaction notes",
    comment: "Comment",
    reactionPlaceholder: "When did it start? What are the symptoms?",
    commentPlaceholder: "Notes unrelated to allergy…",
    loggedAt: (dateTime: string) => `Logged ${dateTime}`,
    preference: "Preference",
    topAllergens: "Top allergens",
    tapToAdjust: "(tap to adjust)",
    enterWhatHeAte: "Enter what he ate",
    saveChanges: "Save changes",
  },
  charts: {
    previousDay: "Previous day",
    nextDay: "Next day",
    today: "Today",
    sevenDayAvg: "7-day avg",
    feedingTitle: "Feeding Volume (7 Days)",
    feedingAverage: (avg: string) => `Running 7-day average: ${avg} ml/day`,
    volume: "Volume",
    diaperTitle: "Diaper Changes (7 Days)",
    diaperAverage: (avg: string, wet: string, dirty: string) =>
      `Stacked bars show wet and dirty changes. Running 7-day average: ${avg} changes/day (${wet} wet, ${dirty} dirty).`,
    wet: "Wet",
    dirty: "Dirty",
    solidsTitle: "Solid Foods (7 Days)",
    solidsAverage: (avg: string) =>
      `Bars show how many solid foods were logged each day. Running 7-day average: ${avg} foods/day.`,
    solids: "Solids",
  },
  celebration: {
    srAnnouncement: "Dirty diaper logged. Celebration animation playing.",
    heDidIt: "He did it!",
  },
  categories: {
    vegetables: "Vegetables",
    fruits: "Fruits",
    proteins: "Proteins & Meat",
    grains: "Grains",
    dairy: "Dairy",
    other: "Other",
  } as Record<FoodCategory, string>,
  allergens: {
    milk: "Milk",
    egg: "Egg",
    peanut: "Peanut",
    tree_nuts: "Tree nuts",
    soy: "Soy",
    wheat: "Wheat",
    fish: "Fish",
    shellfish: "Shellfish",
    sesame: "Sesame",
  } as Record<AllergenKey, string>,
  preferences: {
    dislike: "Disliked",
    neutral: "Neutral",
    okay: "Okay",
    like: "Loved",
  } as Record<FoodPreference, string>,
};

export type Messages = typeof en;

const fr: Messages = {
  header: {
    appName: "Pierre Tracker",
  },
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    edit: "Modifier",
    loading: "Chargement…",
    saving: "Enregistrement…",
    optional: "facultatif",
    failedToLoad: "Échec du chargement",
    failedToLoadData: "Échec du chargement des données",
    failedToSave: "Échec de l'enregistrement",
  },
  languageToggle: {
    switchTo: "Switch to English",
    targetCode: "EN",
  },
  theme: {
    useNightSchedule: "Utiliser l'horaire nocturne",
    theme: "Thème",
    switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre",
    darkScheduled: "Sombre (programmé). Cliquez pour le mode clair.",
    lightScheduled: "Clair (programmé). Cliquez pour le mode sombre.",
    darkOn: "Mode sombre activé. Cliquez pour le mode clair.",
    lightOn: "Mode clair activé. Cliquez pour le mode sombre.",
    light: "Clair",
    dark: "Sombre",
  },
  logger: {
    logActivity: "ENREGISTRER UNE ACTIVITÉ",
    cancel: "ANNULER",
    cancelAria: "Annuler",
    dateLabel: "DATE :",
    timeLabel: "HEURE :",
    eventDate: "Date de l'événement",
    eventTime: "Heure de l'événement",
    backdateNotice: "Enregistrement pour une date passée",
    feedingType: "Type d'alimentation",
    bottle: "Biberon",
    solids: "Solides",
    feedAmount: "Quantité du biberon",
    decreaseAmount: "Diminuer la quantité",
    increaseAmount: "Augmenter la quantité",
    logFeed: "Enregistrer le biberon",
    wet: "Pipi",
    dirty: "Caca",
    alreadyAdded: "Déjà ajouté",
    addAtLeastOneFood: "Ajoutez au moins un aliment",
    failedToLogFoods: "Échec de l'enregistrement des aliments",
    logFoods: (count: number) =>
      count === 1
        ? "Enregistrer 1 aliment"
        : count > 1
          ? `Enregistrer ${count} aliments`
          : "Enregistrer les aliments",
    howDidItGo: (food: string) => `Comment s'est passé ${food} ?`,
    whatDidHeEat: "Qu'a-t-il mangé ?",
    addAnotherFood: "Ajouter un autre aliment",
    foodPlaceholder: "ex. Avocat, Saumon, Beurre de cacahuète",
    foodName: "Nom de l'aliment",
    addFood: (name: string) => `Ajouter « ${name} »`,
    addFoodsHint: "Ajoutez les aliments un par un. La note est facultative.",
    removeFood: (name: string) => `Retirer ${name}`,
    commentOptional: "Commentaire (facultatif)",
    commentPlaceholder: "Texture, haut-le-cœur, associations…",
  },
  summary: {
    title: "Résumé du jour",
    lastFeed: "Dernier biberon",
    fedToday: "Bu aujourd'hui",
    sleptToday: "Dormi aujourd'hui",
    diapersToday: "Couches aujourd'hui",
    diaperUnit: "chang.",
    sleepUnitFallback: "h",
  },
  timeline: {
    title: "Activité récente",
    empty: "Aucun événement récent",
    viewMore: "Voir plus",
    deleteActivity: "Supprimer l'activité",
    failedToDelete: "Échec de la suppression de l'activité",
    solidFood: "Aliment solide",
    feed: "Biberon",
    sleep: "Sommeil",
    diaper: "Couche",
    reaction: "Réaction",
  },
  passport: {
    milestoneTracker: "Suivi des étapes",
    title: "Passeport alimentaire de Pierre",
    empty:
      "Aucun aliment solide enregistré — appuyez sur Enregistrer une activité → Solides pour commencer.",
    foodsIntroduced: (n: number) =>
      `${n} aliment${n === 1 ? "" : "s"} découvert${n === 1 ? "" : "s"}`,
    allergensPassed: (n: number) =>
      `${n} allergène${n === 1 ? "" : "s"} majeur${n === 1 ? "" : "s"} validé${n === 1 ? "" : "s"}`,
    foodsExplored: (n: number) =>
      `${n} aliment${n === 1 ? "" : "s"} exploré${n === 1 ? "" : "s"}`,
    foodCount: (n: number) => `${n} aliment${n === 1 ? "" : "s"}`,
    explore: "Explorer le passeport ›",
    tried: "Essayés :",
    triedOn: (date: string) => `Essayé le ${date}`,
    reactionBadge: "(!) Réaction",
    exploreEmpty:
      "Pas encore d'aliments. Enregistrez un solide depuis le journal d'activité pour remplir le passeport.",
    failedToLoadPassport: "Échec du chargement du passeport",
    backToHistory: "← Retour à l'historique",
    backToPassport: "← Retour au passeport",
    editSolidEntry: "Modifier l'entrée",
    food: "Aliment",
    foodDetail: "Détail de l'aliment",
    category: "Catégorie",
    foodCategory: "Catégorie de l'aliment",
    failedToUpdateCategory: "Échec de la mise à jour de la catégorie",
    failedToLoadFood: "Échec du chargement de l'aliment",
    noExposures: "Aucune exposition pour l'instant.",
    unrated: "Sans note",
    reactionPrefix: "Réaction :",
    reactionLogged: "Enregistrée",
    reportReaction: "Signaler une réaction",
    editComment: "Modifier le commentaire",
    addComment: "Ajouter un commentaire",
    reactionNotes: "Notes de réaction",
    comment: "Commentaire",
    reactionPlaceholder: "Quand cela a-t-il commencé ? Quels sont les symptômes ?",
    commentPlaceholder: "Notes sans lien avec une allergie…",
    loggedAt: (dateTime: string) => `Enregistré le ${dateTime}`,
    preference: "Préférence",
    topAllergens: "Allergènes majeurs",
    tapToAdjust: "(appuyez pour ajuster)",
    enterWhatHeAte: "Indiquez ce qu'il a mangé",
    saveChanges: "Enregistrer les modifications",
  },
  charts: {
    previousDay: "Jour précédent",
    nextDay: "Jour suivant",
    today: "Aujourd'hui",
    sevenDayAvg: "Moy. 7 jours",
    feedingTitle: "Volume des biberons (7 jours)",
    feedingAverage: (avg: string) =>
      `Moyenne glissante sur 7 jours : ${avg} ml/jour`,
    volume: "Volume",
    diaperTitle: "Changements de couches (7 jours)",
    diaperAverage: (avg: string, wet: string, dirty: string) =>
      `Les barres empilées montrent les couches pipi et caca. Moyenne glissante sur 7 jours : ${avg} changements/jour (${wet} pipi, ${dirty} caca).`,
    wet: "Pipi",
    dirty: "Caca",
    solidsTitle: "Aliments solides (7 jours)",
    solidsAverage: (avg: string) =>
      `Les barres montrent le nombre d'aliments solides enregistrés chaque jour. Moyenne glissante sur 7 jours : ${avg} aliments/jour.`,
    solids: "Solides",
  },
  celebration: {
    srAnnouncement:
      "Couche sale enregistrée. Animation de célébration en cours.",
    heDidIt: "Il l'a fait !",
  },
  categories: {
    vegetables: "Légumes",
    fruits: "Fruits",
    proteins: "Protéines et viande",
    grains: "Céréales",
    dairy: "Produits laitiers",
    other: "Autre",
  },
  allergens: {
    milk: "Lait",
    egg: "Œuf",
    peanut: "Arachide",
    tree_nuts: "Fruits à coque",
    soy: "Soja",
    wheat: "Blé",
    fish: "Poisson",
    shellfish: "Crustacés",
    sesame: "Sésame",
  },
  preferences: {
    dislike: "N'a pas aimé",
    neutral: "Neutre",
    okay: "Correct",
    like: "Adoré",
  },
};

const MESSAGES: Record<Locale, Messages> = { en, fr };

type I18nContextValue = {
  locale: Locale;
  t: Messages;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function detectLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "fr") return stored;
  } catch {
    // localStorage unavailable (private mode) — fall through to browser language
  }
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  // Resolve the real locale after mount to avoid SSR hydration mismatches.
  useEffect(() => {
    setLocaleState(detectLocale());
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort; the in-memory locale still applies
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((current) => {
      const next: Locale = current === "en" ? "fr" : "en";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Persistence is best-effort
      }
      return next;
    });
  }, []);

  return (
    <I18nContext.Provider
      value={{ locale, t: MESSAGES[locale], setLocale, toggleLocale }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

// ---------------------------------------------------------------------------
// Locale-aware date/time formatting
// ---------------------------------------------------------------------------

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

/** Long header date, e.g. "Saturday, September 5" / "samedi 5 septembre". */
export function formatLongDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(LOCALE_TAGS[locale], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

/** Short date, e.g. "Sep 5" / "5 sept." */
export function formatShortDate(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleDateString(LOCALE_TAGS[locale], {
    month: "short",
    day: "numeric",
  });
}

/** Time of day: 12-hour for English, 24-hour for French. */
export function formatTimeOfDay(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(LOCALE_TAGS[locale], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: locale === "en",
  });
}

/** Time when today, otherwise "short date, time". */
export function formatEventTime(iso: string, locale: Locale): string {
  const time = formatTimeOfDay(iso, locale);
  if (isToday(iso)) return time;
  return `${formatShortDate(iso, locale)}, ${time}`;
}

/** "Short date · time" regardless of day. */
export function formatDateTime(iso: string, locale: Locale): string {
  return `${formatShortDate(iso, locale)} · ${formatTimeOfDay(iso, locale)}`;
}

/** Locale-aware number formatting (French uses a decimal comma). */
export function formatNumber(
  value: number,
  locale: Locale,
  maximumFractionDigits = 1
): string {
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    maximumFractionDigits,
  }).format(value);
}
