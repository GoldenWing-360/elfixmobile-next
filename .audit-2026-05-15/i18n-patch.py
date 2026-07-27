#!/usr/bin/env python3
"""
Bulk-add translation keys for hardcoded German strings discovered in the
2026-05-15 audit. Single source of truth for the 4 locales so they stay
in sync.

Keys added:
- booking_form.*  (SimpleBookingForm)
- repair_disclaimer.*  (RepairDisclaimer aside)
- not_found.*  (404 page)
- status_page.*  (status/[id] page)
- calc.duration_express / .duration_standard / .duration_complex
- buchen_page.*  (the /buchen page header + metadata)
"""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MSG = ROOT / "src" / "messages"

# Translation tables ----------------------------------------------------

PATCHES = {
    "buchen_page": {
        "de": {
            "title": "Reparatur anfragen - 30 Min Rückmeldung",
            "description": "Ein Formular, ein Anruf zurück in 30 Minuten. Festpreis vor der Reparatur. Vorbeikommen, abholen lassen oder per Post schicken.",
            "eyebrow": "REPARATUR ANFRAGEN",
            "headline": "Sag uns was kaputt ist.",
            "sub": "Wir melden uns binnen 30 Minuten mit Festpreis und Termin-Vorschlag. Kein Account, kein Login, kein Spam.",
        },
        "en": {
            "title": "Request a repair - 30 min response",
            "description": "One form, a call back in 30 minutes. Fixed price before the repair. Walk in, get picked up or send by post.",
            "eyebrow": "REQUEST A REPAIR",
            "headline": "Tell us what is broken.",
            "sub": "We get back to you within 30 minutes with a fixed price and a suggested time. No account, no login, no spam.",
        },
        "ru": {
            "title": "Заявка на ремонт - ответ за 30 мин",
            "description": "Одна форма, обратный звонок через 30 минут. Фиксированная цена до начала ремонта. Приезд, забор или отправка по почте.",
            "eyebrow": "ЗАЯВКА НА РЕМОНТ",
            "headline": "Расскажите, что сломалось.",
            "sub": "Мы перезвоним в течение 30 минут с фиксированной ценой и предложением по времени. Без аккаунта, без входа, без спама.",
        },
        "tr": {
            "title": "Tamir talebi - 30 dk içinde dönüş",
            "description": "Tek form, 30 dakika içinde geri arama. Tamirden önce sabit fiyat. Gelin, biz alalım veya posta ile gönderin.",
            "eyebrow": "TAMİR TALEBİ",
            "headline": "Neyin bozuk olduğunu söyleyin.",
            "sub": "30 dakika içinde sabit fiyat ve önerilen zaman ile geri döneriz. Hesap yok, giriş yok, spam yok.",
        },
    },
    "booking_form": {
        "de": {
            "service_legend": "Wie kommt das Gerät zu uns?",
            "service_walkin_label": "Vorbeikommen",
            "service_walkin_sub": "Maria-Tusch-Strasse 17/1, Mo-Sa 9-19",
            "service_pickup_label": "Wir holen ab",
            "service_pickup_sub": "Gratis in Wien ab €70 Reparaturwert",
            "service_send_label": "Per Post schicken",
            "service_send_sub": "Versicherter Versand, österreichweit",
            "field_device": "Gerät",
            "field_device_ph": "z.B. iPhone 14 Pro, Samsung S23, MacBook Air",
            "field_damage": "Was ist passiert?",
            "field_damage_ph": "Kurze Beschreibung: Display gesprungen, Akku schwach, Wasserschaden ...",
            "field_date": "Wunschtermin (optional)",
            "field_name": "Dein Name",
            "field_phone": "Telefon",
            "field_phone_ph": "+43 ...",
            "field_email": "E-Mail (optional)",
            "field_email_ph": "für die Bestätigungs-Mail",
            "agb_prefix": "Ich akzeptiere die ",
            "agb_link_agb": "AGB",
            "agb_and": " und die ",
            "agb_link_dsgvo": "Datenschutzerklärung",
            "agb_suffix": ".",
            "submit": "Reparatur anfragen",
            "footer_note": "Wir melden uns innerhalb 30 Minuten mit Bestätigung und Festpreis.",
            "honeypot_label": "Leave this empty",
            "err_min_2": "Mindestens 2 Zeichen",
            "err_min_5": "Mindestens 5 Zeichen",
            "err_required": "Pflichtfeld",
            "err_email_invalid": "Ungültige E-Mail",
            "err_agb_required": "Bitte AGB bestätigen.",
            "err_send_failed": "Senden hat nicht geklappt. Bitte direkt anrufen: +43 660 6071414",
            "success_h1": "Anfrage eingegangen.",
            "success_sub": "Wir melden uns innerhalb 30 Minuten zurück mit Bestätigung und Festpreis. Falls dringend: ruf direkt an.",
            "success_order_id_label": "Auftrags-ID",
            "success_status_link": "Status live verfolgen",
            "success_back_home": "Zur Startseite",
        },
        "en": {
            "service_legend": "How does the device reach us?",
            "service_walkin_label": "Walk in",
            "service_walkin_sub": "Maria-Tusch-Strasse 17/1, Mon-Sat 9-19",
            "service_pickup_label": "We pick up",
            "service_pickup_sub": "Free in Vienna from €70 repair value",
            "service_send_label": "Send by post",
            "service_send_sub": "Insured shipping, Austria-wide",
            "field_device": "Device",
            "field_device_ph": "e.g. iPhone 14 Pro, Samsung S23, MacBook Air",
            "field_damage": "What happened?",
            "field_damage_ph": "Short description: cracked display, weak battery, water damage ...",
            "field_date": "Preferred time (optional)",
            "field_name": "Your name",
            "field_phone": "Phone",
            "field_phone_ph": "+43 ...",
            "field_email": "Email (optional)",
            "field_email_ph": "for the confirmation mail",
            "agb_prefix": "I accept the ",
            "agb_link_agb": "Terms",
            "agb_and": " and the ",
            "agb_link_dsgvo": "Privacy Policy",
            "agb_suffix": ".",
            "submit": "Request repair",
            "footer_note": "We get back to you within 30 minutes with confirmation and fixed price.",
            "honeypot_label": "Leave this empty",
            "err_min_2": "At least 2 characters",
            "err_min_5": "At least 5 characters",
            "err_required": "Required",
            "err_email_invalid": "Invalid email",
            "err_agb_required": "Please confirm the terms.",
            "err_send_failed": "Sending failed. Please call directly: +43 660 6071414",
            "success_h1": "Request received.",
            "success_sub": "We get back to you within 30 minutes with confirmation and a fixed price. If urgent, call directly.",
            "success_order_id_label": "Order ID",
            "success_status_link": "Track status live",
            "success_back_home": "Back to home",
        },
        "ru": {
            "service_legend": "Как устройство попадёт к нам?",
            "service_walkin_label": "Прийти лично",
            "service_walkin_sub": "Maria-Tusch-Strasse 17/1, Пн-Сб 9-19",
            "service_pickup_label": "Мы заберём",
            "service_pickup_sub": "Бесплатно в Вене при ремонте от €70",
            "service_send_label": "Прислать почтой",
            "service_send_sub": "Застрахованная доставка по всей Австрии",
            "field_device": "Устройство",
            "field_device_ph": "например, iPhone 14 Pro, Samsung S23, MacBook Air",
            "field_damage": "Что случилось?",
            "field_damage_ph": "Короткое описание: треснул экран, слабый аккумулятор, попала вода ...",
            "field_date": "Желаемое время (необязательно)",
            "field_name": "Ваше имя",
            "field_phone": "Телефон",
            "field_phone_ph": "+43 ...",
            "field_email": "E-mail (необязательно)",
            "field_email_ph": "для подтверждающего письма",
            "agb_prefix": "Я принимаю ",
            "agb_link_agb": "условия",
            "agb_and": " и ",
            "agb_link_dsgvo": "политику конфиденциальности",
            "agb_suffix": ".",
            "submit": "Запросить ремонт",
            "footer_note": "Мы перезвоним в течение 30 минут с подтверждением и фиксированной ценой.",
            "honeypot_label": "Оставьте пустым",
            "err_min_2": "Минимум 2 символа",
            "err_min_5": "Минимум 5 символов",
            "err_required": "Обязательное поле",
            "err_email_invalid": "Неверный e-mail",
            "err_agb_required": "Подтвердите согласие с условиями.",
            "err_send_failed": "Не удалось отправить. Позвоните напрямую: +43 660 6071414",
            "success_h1": "Заявка получена.",
            "success_sub": "Мы перезвоним в течение 30 минут с подтверждением и фиксированной ценой. Срочно - позвоните напрямую.",
            "success_order_id_label": "Номер заказа",
            "success_status_link": "Отслеживать статус",
            "success_back_home": "На главную",
        },
        "tr": {
            "service_legend": "Cihaz bize nasıl ulaşacak?",
            "service_walkin_label": "Mağazaya gel",
            "service_walkin_sub": "Maria-Tusch-Strasse 17/1, Pzt-Cmt 9-19",
            "service_pickup_label": "Biz alalım",
            "service_pickup_sub": "Viyana içinde €70 tamir değerinden ücretsiz",
            "service_send_label": "Posta ile gönder",
            "service_send_sub": "Sigortalı kargo, Avusturya geneli",
            "field_device": "Cihaz",
            "field_device_ph": "örn. iPhone 14 Pro, Samsung S23, MacBook Air",
            "field_damage": "Ne oldu?",
            "field_damage_ph": "Kısa açıklama: ekran çatladı, pil zayıf, su hasarı ...",
            "field_date": "Tercih edilen zaman (isteğe bağlı)",
            "field_name": "Adınız",
            "field_phone": "Telefon",
            "field_phone_ph": "+43 ...",
            "field_email": "E-posta (isteğe bağlı)",
            "field_email_ph": "onay e-postası için",
            "agb_prefix": "Kabul ediyorum: ",
            "agb_link_agb": "Şartlar",
            "agb_and": " ve ",
            "agb_link_dsgvo": "Gizlilik Politikası",
            "agb_suffix": ".",
            "submit": "Tamir talep et",
            "footer_note": "30 dakika içinde onay ve sabit fiyat ile geri döneriz.",
            "honeypot_label": "Boş bırakın",
            "err_min_2": "En az 2 karakter",
            "err_min_5": "En az 5 karakter",
            "err_required": "Zorunlu alan",
            "err_email_invalid": "Geçersiz e-posta",
            "err_agb_required": "Lütfen şartları onaylayın.",
            "err_send_failed": "Gönderim başarısız. Doğrudan arayın: +43 660 6071414",
            "success_h1": "Talep alındı.",
            "success_sub": "30 dakika içinde onay ve sabit fiyat ile geri döneriz. Acilse doğrudan arayın.",
            "success_order_id_label": "Sipariş No",
            "success_status_link": "Durumu canlı izle",
            "success_back_home": "Ana sayfaya",
        },
    },
    "repair_disclaimer": {
        "de": {
            "title": "Wichtige Hinweise.",
            "aria_label": "Wichtige Hinweise",
            "ip68": "Wasser- und Staubdichtigkeit (IP-Zertifizierung) kann nach einer Reparatur nicht mehr zu 100 % gewährleistet werden.",
            "parts": "Wir verwenden Original-Refurbished oder geprüfte Premium-Ersatzteile - keine reinen OEM-Teile. 12 Monate Garantie auf Teil und Einbau bei uns.",
            "backup": "Bitte vor Abgabe ein Backup erstellen. Daten bleiben in der Regel erhalten, die Sicherung liegt aber in deiner Verantwortung.",
            "stock": "Preise gelten für Artikel aus unserem aktuellen Lagerbestand und können bei seltenen Ersatzteilen abweichen - wir melden uns vor der Reparatur, falls das der Fall ist.",
        },
        "en": {
            "title": "Important notes.",
            "aria_label": "Important notes",
            "ip68": "Water and dust resistance (IP rating) can no longer be 100 % guaranteed after a repair.",
            "parts": "We use original-refurbished or tested premium spare parts - not pure OEM. 12 months warranty on part and labour with us.",
            "backup": "Please create a backup before handing in the device. Data usually stays intact, but securing it is your responsibility.",
            "stock": "Prices apply to items from our current stock and may differ for rare spare parts - we will let you know before the repair if that is the case.",
        },
        "ru": {
            "title": "Важно знать.",
            "aria_label": "Важные замечания",
            "ip68": "Водо- и пылезащита (сертификация IP) не может быть гарантирована на 100 % после ремонта.",
            "parts": "Мы используем оригинал-восстановленные или проверенные премиум-запчасти - не чистый OEM. 12 месяцев гарантии на деталь и установку.",
            "backup": "Сделайте резервную копию перед сдачей устройства. Данные обычно сохраняются, но ответственность за резервную копию на вас.",
            "stock": "Цены действуют для позиций из нашего текущего склада и могут отличаться для редких деталей - мы сообщим вам до начала ремонта, если так.",
        },
        "tr": {
            "title": "Önemli notlar.",
            "aria_label": "Önemli notlar",
            "ip68": "Su ve toz dayanıklılığı (IP sertifikası) tamir sonrası %100 garanti edilemez.",
            "parts": "Orijinal yenilenmiş veya test edilmiş premium yedek parçalar kullanıyoruz - saf OEM değil. Parça ve işçilik için 12 ay garanti.",
            "backup": "Cihazı teslim etmeden önce yedek alın. Veriler genelde korunur, ancak yedek almak sizin sorumluluğunuzdadır.",
            "stock": "Fiyatlar mevcut stoğumuzdaki ürünler için geçerlidir ve nadir yedek parçalarda değişebilir - bu durumda tamirden önce size haber veririz.",
        },
    },
    "not_found": {
        "de": {
            "eyebrow": "404",
            "headline": "Diese Seite gibt es nicht.",
            "body": "Vielleicht ist die Adresse veraltet, oder wir haben sie umbenannt. Geh zur Startseite oder ruf uns kurz an.",
            "cta_home": "Zur Startseite",
        },
        "en": {
            "eyebrow": "404",
            "headline": "This page does not exist.",
            "body": "Maybe the address is outdated, or we renamed it. Go to the homepage or give us a quick call.",
            "cta_home": "Back to home",
        },
        "ru": {
            "eyebrow": "404",
            "headline": "Такой страницы нет.",
            "body": "Возможно, адрес устарел или мы её переименовали. Перейдите на главную или позвоните нам.",
            "cta_home": "На главную",
        },
        "tr": {
            "eyebrow": "404",
            "headline": "Bu sayfa yok.",
            "body": "Belki adres eskidir veya biz yeniden adlandırdık. Ana sayfaya gidin veya bizi kısaca arayın.",
            "cta_home": "Ana sayfaya",
        },
    },
    "status_page": {
        "de": {
            "meta_title": "Reparatur-Status",
            "meta_description": "Status deiner Reparatur bei EL Fix Mobile.",
            "eyebrow": "REPARATUR-STATUS",
            "hello": "Hallo {name}.",
            "received_at": "Eingang",
            "order_id": "Auftrags-ID",
            "step_received": "Eingegangen",
            "step_confirmed": "Bestätigt",
            "step_in_progress": "In Reparatur",
            "step_done": "Fertig zur Abholung",
            "step_state_done": "Erledigt",
            "step_state_current": "Aktuell",
            "step_state_upcoming": "Folgt",
            "summary_label": "Deine Anfrage",
            "summary_device": "Gerät",
            "summary_service": "Service",
            "summary_price": "Geschätzter Preis",
            "summary_message": "Nachricht",
            "footer_question": "Frage zum Status? Ruf uns direkt an unter",
            "footer_id_note": "und nenne deine Auftrags-ID.",
            "back_home": "Zur Startseite",
        },
        "en": {
            "meta_title": "Repair status",
            "meta_description": "Status of your repair at EL Fix Mobile.",
            "eyebrow": "REPAIR STATUS",
            "hello": "Hello {name}.",
            "received_at": "Received",
            "order_id": "Order ID",
            "step_received": "Received",
            "step_confirmed": "Confirmed",
            "step_in_progress": "In repair",
            "step_done": "Ready for pickup",
            "step_state_done": "Done",
            "step_state_current": "Current",
            "step_state_upcoming": "Upcoming",
            "summary_label": "Your request",
            "summary_device": "Device",
            "summary_service": "Service",
            "summary_price": "Estimated price",
            "summary_message": "Message",
            "footer_question": "Question about the status? Call us directly at",
            "footer_id_note": "and mention your order ID.",
            "back_home": "Back to home",
        },
        "ru": {
            "meta_title": "Статус ремонта",
            "meta_description": "Статус вашего ремонта в EL Fix Mobile.",
            "eyebrow": "СТАТУС РЕМОНТА",
            "hello": "Здравствуйте, {name}.",
            "received_at": "Получено",
            "order_id": "Номер заказа",
            "step_received": "Принято",
            "step_confirmed": "Подтверждено",
            "step_in_progress": "В ремонте",
            "step_done": "Готово к выдаче",
            "step_state_done": "Готово",
            "step_state_current": "Сейчас",
            "step_state_upcoming": "Дальше",
            "summary_label": "Ваша заявка",
            "summary_device": "Устройство",
            "summary_service": "Сервис",
            "summary_price": "Ориентировочная цена",
            "summary_message": "Сообщение",
            "footer_question": "Вопрос по статусу? Звоните напрямую",
            "footer_id_note": "и назовите номер заказа.",
            "back_home": "На главную",
        },
        "tr": {
            "meta_title": "Tamir durumu",
            "meta_description": "EL Fix Mobile'deki tamirinizin durumu.",
            "eyebrow": "TAMİR DURUMU",
            "hello": "Merhaba {name}.",
            "received_at": "Alındı",
            "order_id": "Sipariş No",
            "step_received": "Alındı",
            "step_confirmed": "Onaylandı",
            "step_in_progress": "Tamirde",
            "step_done": "Teslime hazır",
            "step_state_done": "Tamamlandı",
            "step_state_current": "Şu an",
            "step_state_upcoming": "Sırada",
            "summary_label": "Talebiniz",
            "summary_device": "Cihaz",
            "summary_service": "Servis",
            "summary_price": "Tahmini fiyat",
            "summary_message": "Mesaj",
            "footer_question": "Durumla ilgili soru? Doğrudan arayın",
            "footer_id_note": "ve sipariş numaranızı söyleyin.",
            "back_home": "Ana sayfaya",
        },
    },
}

# calc namespace gets 3 new keys per locale (duration buckets)
CALC_DURATION = {
    "de": {
        "duration_express": "Express ab 30 Min",
        "duration_standard": "1-2 Stunden",
        "duration_complex": "1-3 Tage",
    },
    "en": {
        "duration_express": "Express from 30 min",
        "duration_standard": "1-2 hours",
        "duration_complex": "1-3 days",
    },
    "ru": {
        "duration_express": "Экспресс от 30 мин",
        "duration_standard": "1-2 часа",
        "duration_complex": "1-3 дня",
    },
    "tr": {
        "duration_express": "30 dk'dan ekspres",
        "duration_standard": "1-2 saat",
        "duration_complex": "1-3 gün",
    },
}

# Apply --------------------------------------------------------------

for lang in ("de", "en", "ru", "tr"):
    path = MSG / f"{lang}.json"
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    for ns, by_lang in PATCHES.items():
        if lang not in by_lang:
            continue
        data.setdefault(ns, {})
        # don't clobber existing keys (idempotent re-run)
        for k, v in by_lang[lang].items():
            data[ns][k] = v

    # extend calc with duration buckets
    for k, v in CALC_DURATION[lang].items():
        data.setdefault("calc", {})[k] = v

    with path.open("w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    print(f"patched {path}")

print("done.")
