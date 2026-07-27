#!/usr/bin/env python3
"""Second wave of translation keys: reparatur hub, modelle, preisrechner metadata, SEO description, calculator WhatsApp prefill."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MSG = ROOT / "src" / "messages"

PATCHES = {
    "reparatur_hub": {
        "de": {
            "meta_title": "Reparatur - alle Marken und Services | EL Fix Mobile Wien",
            "meta_description": "Wir reparieren iPhone, Samsung, Xiaomi, Google Pixel und mehr in Wien 1220 Aspern. Festpreise, 12 Monate Garantie, Express in 30 Minuten.",
            "eyebrow": "REPARATUR",
            "headline": "Wir reparieren alle.",
            "sub": "8 Marken mit Festpreisen, 219 Modelle, alle Reparatur-Arten. Wähle deine Marke unten oder direkt eine Reparatur-Art.",
            "h2_brand": "Marke wählen",
            "h2_service": "Direkt zur Reparatur-Art",
            "model_count": "{count} Modelle",
        },
        "en": {
            "meta_title": "Repair - all brands and services | EL Fix Mobile Vienna",
            "meta_description": "We repair iPhone, Samsung, Xiaomi, Google Pixel and more in Vienna 1220 Aspern. Fixed prices, 12 months warranty, express in 30 minutes.",
            "eyebrow": "REPAIR",
            "headline": "We repair all.",
            "sub": "8 brands with fixed prices, 219 models, every repair type. Pick your brand below or jump straight to a repair type.",
            "h2_brand": "Pick a brand",
            "h2_service": "Jump straight to a repair type",
            "model_count": "{count} models",
        },
        "ru": {
            "meta_title": "Ремонт - все бренды и услуги | EL Fix Mobile Вена",
            "meta_description": "Мы ремонтируем iPhone, Samsung, Xiaomi, Google Pixel и другие в Вене 1220 Aspern. Фиксированные цены, 12 месяцев гарантии, экспресс за 30 минут.",
            "eyebrow": "РЕМОНТ",
            "headline": "Чиним всё.",
            "sub": "8 брендов с фиксированными ценами, 219 моделей, все виды ремонта. Выберите бренд ниже или сразу вид ремонта.",
            "h2_brand": "Выбрать бренд",
            "h2_service": "Сразу к виду ремонта",
            "model_count": "{count} моделей",
        },
        "tr": {
            "meta_title": "Tamir - tüm markalar ve hizmetler | EL Fix Mobile Viyana",
            "meta_description": "iPhone, Samsung, Xiaomi, Google Pixel ve daha fazlasını Viyana 1220 Aspern'de tamir ediyoruz. Sabit fiyatlar, 12 ay garanti, 30 dk ekspres.",
            "eyebrow": "TAMİR",
            "headline": "Hepsini tamir ederiz.",
            "sub": "Sabit fiyatlı 8 marka, 219 model, her tamir türü. Aşağıdan markanızı seçin veya doğrudan tamir türüne gidin.",
            "h2_brand": "Marka seç",
            "h2_service": "Doğrudan tamir türüne",
            "model_count": "{count} model",
        },
    },
    "service_labels": {
        "de": {
            "display": "Display Reparatur",
            "battery": "Akku Tausch",
            "data_recovery": "Datenrettung",
            "water_damage": "Wasserschaden",
            "unlock": "Handy entsperren",
            "wrap": "Handy Folierung",
            "camera": "Kamera Reparatur",
            "tablet": "Tablet Reparatur",
            "notebook": "Notebook Reparatur",
        },
        "en": {
            "display": "Display repair",
            "battery": "Battery replacement",
            "data_recovery": "Data recovery",
            "water_damage": "Water damage",
            "unlock": "Phone unlocking",
            "wrap": "Phone wrap",
            "camera": "Camera repair",
            "tablet": "Tablet repair",
            "notebook": "Laptop repair",
        },
        "ru": {
            "display": "Замена экрана",
            "battery": "Замена аккумулятора",
            "data_recovery": "Восстановление данных",
            "water_damage": "После воды",
            "unlock": "Разблокировка",
            "wrap": "Пленка / скин",
            "camera": "Ремонт камеры",
            "tablet": "Ремонт планшета",
            "notebook": "Ремонт ноутбука",
        },
        "tr": {
            "display": "Ekran tamiri",
            "battery": "Pil değişimi",
            "data_recovery": "Veri kurtarma",
            "water_damage": "Su hasarı",
            "unlock": "Telefon kilit açma",
            "wrap": "Telefon kaplama",
            "camera": "Kamera tamiri",
            "tablet": "Tablet tamiri",
            "notebook": "Dizüstü tamiri",
        },
    },
    "brand_modelle": {
        "de": {
            "meta_title": "Alle {brand}-Modelle | EL Fix Mobile Wien",
            "meta_description": "Vollständige Liste aller {brand}-Modelle, die wir in Wien 1220 Aspern reparieren. Festpreise, 12 Monate Garantie, Express-Service.",
            "eyebrow_suffix": "REPARATUR",
            "headline": "Alle {brand}-Modelle.",
            "sub": "{count} Modelle, alle reparierbar in Wien 1220 Aspern. Festpreis vor der Reparatur, 12 Monate Garantie, Express-Service in 30 Minuten möglich.",
            "older_group": "Ältere Modelle",
            "footer_missing_prefix": "Modell nicht dabei? Wir reparieren auch ältere {brand}-Geräte auf Anfrage - ",
            "footer_missing_link": "schreib uns kurz",
            "footer_missing_middle": " oder ",
            "footer_missing_call": "ruf direkt an",
            "footer_missing_suffix": ".",
            "back_overview": "Zurück zur {brand}-Übersicht",
        },
        "en": {
            "meta_title": "All {brand} models | EL Fix Mobile Vienna",
            "meta_description": "Full list of all {brand} models we repair in Vienna 1220 Aspern. Fixed prices, 12 months warranty, express service.",
            "eyebrow_suffix": "REPAIR",
            "headline": "All {brand} models.",
            "sub": "{count} models, all repairable in Vienna 1220 Aspern. Fixed price before the repair, 12 months warranty, express service in 30 minutes possible.",
            "older_group": "Older models",
            "footer_missing_prefix": "Model not listed? We repair older {brand} devices on request - ",
            "footer_missing_link": "drop us a line",
            "footer_missing_middle": " or ",
            "footer_missing_call": "call us directly",
            "footer_missing_suffix": ".",
            "back_overview": "Back to {brand} overview",
        },
        "ru": {
            "meta_title": "Все модели {brand} | EL Fix Mobile Вена",
            "meta_description": "Полный список моделей {brand}, которые мы ремонтируем в Вене 1220 Aspern. Фиксированные цены, 12 месяцев гарантии, экспресс-сервис.",
            "eyebrow_suffix": "РЕМОНТ",
            "headline": "Все модели {brand}.",
            "sub": "{count} моделей, все ремонтируем в Вене 1220 Aspern. Фиксированная цена до ремонта, 12 месяцев гарантии, экспресс за 30 минут.",
            "older_group": "Более старые модели",
            "footer_missing_prefix": "Нет вашей модели? Чиним и старые устройства {brand} по запросу - ",
            "footer_missing_link": "напишите нам",
            "footer_missing_middle": " или ",
            "footer_missing_call": "позвоните напрямую",
            "footer_missing_suffix": ".",
            "back_overview": "Назад к обзору {brand}",
        },
        "tr": {
            "meta_title": "Tüm {brand} modelleri | EL Fix Mobile Viyana",
            "meta_description": "Viyana 1220 Aspern'de tamir ettiğimiz tüm {brand} modellerinin tam listesi. Sabit fiyatlar, 12 ay garanti, ekspres servis.",
            "eyebrow_suffix": "TAMİR",
            "headline": "Tüm {brand} modelleri.",
            "sub": "{count} model, hepsi Viyana 1220 Aspern'de tamir edilebilir. Tamirden önce sabit fiyat, 12 ay garanti, 30 dakikada ekspres.",
            "older_group": "Daha eski modeller",
            "footer_missing_prefix": "Modeliniz yok mu? Daha eski {brand} cihazları da talep üzerine tamir ediyoruz - ",
            "footer_missing_link": "bize yazın",
            "footer_missing_middle": " veya ",
            "footer_missing_call": "doğrudan arayın",
            "footer_missing_suffix": ".",
            "back_overview": "{brand} özetine dön",
        },
    },
    "preisrechner_page": {
        "de": {
            "meta_title": "Preisrechner - Festpreis in 10 Sekunden",
            "meta_description": "Sofort-Preisrechner für Handy-, iPad- und Smartwatch-Reparatur in Wien. Marke und Modell wählen, Festpreis erhalten, gratis Abholung möglich.",
        },
        "en": {
            "meta_title": "Price calculator - fixed price in 10 seconds",
            "meta_description": "Instant price calculator for phone, iPad and smartwatch repair in Vienna. Pick brand and model, get a fixed price, free pickup available.",
        },
        "ru": {
            "meta_title": "Калькулятор цен - фиксированная цена за 10 секунд",
            "meta_description": "Моментальный калькулятор для ремонта телефонов, iPad и часов в Вене. Выберите бренд и модель, получите фиксированную цену, бесплатный заезд.",
        },
        "tr": {
            "meta_title": "Fiyat hesaplayıcı - 10 saniyede sabit fiyat",
            "meta_description": "Viyana'da telefon, iPad ve akıllı saat tamiri için anlık fiyat hesaplayıcı. Marka ve modeli seçin, sabit fiyat alın, ücretsiz alım mümkün.",
        },
    },
    "local_business": {
        "de": {
            "description": "Express Smartphone, Tablet und Notebook Reparatur in Wien 1220 Aspern. Original Refurbished Displays, 12 Monate Garantie, 7 Tage offen.",
        },
        "en": {
            "description": "Express smartphone, tablet and laptop repair in Vienna 1220 Aspern. Original-refurbished displays, 12 months warranty, open 7 days.",
        },
        "ru": {
            "description": "Экспресс-ремонт смартфонов, планшетов и ноутбуков в Вене 1220 Aspern. Оригинал-восстановленные дисплеи, 12 месяцев гарантии, 7 дней в неделю.",
        },
        "tr": {
            "description": "Viyana 1220 Aspern'de ekspres akıllı telefon, tablet ve dizüstü tamiri. Orijinal yenilenmiş ekranlar, 12 ay garanti, 7 gün açık.",
        },
    },
    "calc_whatsapp": {
        "de": {
            "prefill": "Hi! Ich brauche eine {repairs} Reparatur für mein {model}. Festpreis laut Online-Rechner: {total} €.",
        },
        "en": {
            "prefill": "Hi! I need a {repairs} repair for my {model}. Online calculator quote: {total} €.",
        },
        "ru": {
            "prefill": "Привет! Мне нужен ремонт {repairs} для моего {model}. Цена по онлайн-калькулятору: {total} €.",
        },
        "tr": {
            "prefill": "Merhaba! {model} için {repairs} tamiri lazım. Online hesaplayıcı fiyatı: {total} €.",
        },
    },
}

for lang in ("de", "en", "ru", "tr"):
    path = MSG / f"{lang}.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    for ns, by_lang in PATCHES.items():
        if lang not in by_lang:
            continue
        data.setdefault(ns, {})
        for k, v in by_lang[lang].items():
            data[ns][k] = v
    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"patched {path}")
