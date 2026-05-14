/**
 * Repair-type label dictionary for all 4 locales. The pricing.json source
 * only defines label_de / label_en, and only for a subset of slugs — but
 * actual model price-maps reference 15 distinct repair slugs. Anything
 * missing here renders as the raw slug, which is what users see, so the
 * coverage matrix lives here and stays in sync with pricing.json keys.
 */

export type RepairSlug =
  | "display"
  | "display_orig"
  | "battery"
  | "charging_port"
  | "camera_back"
  | "camera_front"
  | "camera_glass"
  | "back_cover"
  | "speaker"
  | "earpiece"
  | "microphone"
  | "home_button"
  | "power_button"
  | "mute_switch"
  | "light_sensor";

type LabelMap = Record<RepairSlug, { de: string; en: string; ru: string; tr: string }>;

// `display` = full display module (LCD/OLED + glass) replacement
//   with Premium-Refurbished parts.
// `display_orig` = front-glass-only swap using Original-Refurbished
//   glass. Used when the LCD/OLED below is still intact and only the
//   cover glass is broken. Different REPAIRS, not different qualities
//   of the same repair — the user pays for only what's actually broken.
export const REPAIR_LABELS: LabelMap = {
  display: {
    de: "Display Komplett",
    en: "Display (full module)",
    ru: "Дисплей (модуль)",
    tr: "Ekran (modül)",
  },
  display_orig: {
    de: "Displayglas",
    en: "Display glass only",
    ru: "Стекло дисплея",
    tr: "Sadece ekran camı",
  },
  battery: { de: "Akku", en: "Battery", ru: "Аккумулятор", tr: "Pil" },
  charging_port: {
    de: "Ladebuchse",
    en: "Charging Port",
    ru: "Разъём зарядки",
    tr: "Şarj Soketi",
  },
  camera_back: {
    de: "Kamera hinten",
    en: "Rear Camera",
    ru: "Задняя камера",
    tr: "Arka Kamera",
  },
  camera_front: {
    de: "Frontkamera",
    en: "Front Camera",
    ru: "Фронтальная камера",
    tr: "Ön Kamera",
  },
  camera_glass: {
    de: "Kameraglas",
    en: "Camera Glass",
    ru: "Стекло камеры",
    tr: "Kamera Camı",
  },
  back_cover: {
    de: "Backcover",
    en: "Back Cover",
    ru: "Задняя крышка",
    tr: "Arka Kapak",
  },
  speaker: {
    de: "Lautsprecher",
    en: "Speaker",
    ru: "Динамик",
    tr: "Hoparlör",
  },
  earpiece: {
    de: "Hörmuschel",
    en: "Earpiece",
    ru: "Слуховой динамик",
    tr: "Kulaklık",
  },
  microphone: { de: "Mikrofon", en: "Microphone", ru: "Микрофон", tr: "Mikrofon" },
  home_button: {
    de: "Home-Taste",
    en: "Home Button",
    ru: "Кнопка Home",
    tr: "Home Tuşu",
  },
  power_button: {
    de: "Power-Taste",
    en: "Power Button",
    ru: "Кнопка питания",
    tr: "Güç Tuşu",
  },
  mute_switch: {
    de: "Stummschalter",
    en: "Mute Switch",
    ru: "Переключатель звука",
    tr: "Sessiz Tuşu",
  },
  light_sensor: {
    de: "Lichtsensor",
    en: "Light Sensor",
    ru: "Датчик света",
    tr: "Işık Sensörü",
  },
};

export function repairLabel(slug: string, locale: "de" | "en" | "ru" | "tr"): string {
  const entry = REPAIR_LABELS[slug as RepairSlug];
  return entry?.[locale] ?? slug;
}

/**
 * Repair categories rough enough to assign one of three duration buckets
 * (express, standard, complex). Drives the "30 min" / "1-2 h" / "24-72 h"
 * label per row on the model page.
 */
export function repairDurationBucket(slug: string): "express" | "standard" | "complex" {
  switch (slug as RepairSlug) {
    case "display":
    case "display_orig":
    case "battery":
    case "back_cover":
    case "speaker":
    case "earpiece":
    case "microphone":
    case "home_button":
    case "power_button":
    case "mute_switch":
      return "express";
    case "charging_port":
    case "camera_back":
    case "camera_front":
    case "camera_glass":
    case "light_sensor":
      return "standard";
    default:
      return "standard";
  }
}
