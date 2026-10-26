# The Logistika Holding — сайт

Лендинг транспортной компании The Logistika Holding (Ташкент). Статический сайт: HTML + CSS + чистый JavaScript, без сборки. Заявки с формы уходят в Telegram через serverless-функцию Vercel.

## Структура

```
index.html              — главная страница (RU, источник), SEO-мета, Open Graph, JSON-LD
uz/index.html, en/index.html — узбекская и английская версии (генерируются, не редактировать руками)
i18n/translations.json  — переводы: [русский, English, O‘zbekcha]
scripts/build-i18n.mjs  — сборка /uz/ и /en/ из index.html
404.html                — страница «не найдено»
api/lead.js             — Vercel Function: POST /api/lead → сообщение в Telegram
assets/css/styles.css   — стили (mobile-first, брендбук)
assets/js/main.js       — меню, анимации, вкладки услуг, интерактивная карта, формы
assets/fonts/           — Inter (self-hosted, кириллица + латиница)
assets/img/             — логотипы, favicon, иконки, og-image.jpg
robots.txt, sitemap.xml, site.webmanifest, vercel.json
```

## Языки (RU / UZ / EN)

Русская версия — `index.html`, она же источник. После любых правок текста:

1. добавьте/исправьте строку в `i18n/translations.json` — `[«как в index.html», "English", "O‘zbekcha"]`;
2. запустите `node scripts/build-i18n.mjs` — он пересоздаст `en/index.html` и `uz/index.html`;
3. если какой-то русский текст остался без перевода, скрипт перечислит его и завершится с ошибкой.

Переключатель языков в шапке ведёт на `/`, `/uz/`, `/en/`; в `<head>` прописаны `hreflang`, в `sitemap.xml` — все три версии.

## Локальный просмотр

```bash
npx serve .            # или: python3 -m http.server 8000  (пути к ресурсам абсолютные — открывайте через сервер, не как файл)
```

Форма заявки работает только на Vercel (или через `vercel dev`), локально покажет сообщение с телефоном.

## Деплой на Vercel

1. Импортируйте репозиторий в Vercel (Framework preset: **Other**, Build command — пусто, Output — корень).
2. Добавьте переменные окружения (Settings → Environment Variables):
   - `TELEGRAM_BOT_TOKEN` — токен бота от [@BotFather](https://t.me/BotFather)
   - `TELEGRAM_CHAT_ID` — куда слать заявки:
     - **личный чат**: напишите боту `/start`, затем узнайте свой id у [@userinfobot](https://t.me/userinfobot);
     - **группа**: добавьте бота в группу, id вида `-100…`;
     - **канал**: добавьте бота администратором канала, укажите `@имя_канала` или `-100…`.
3. Redeploy — готово. Проверьте форму на сайте.

## Перед запуском замените

- [ ] `https://your-domain.uz` → ваш домен (index.html, robots.txt, sitemap.xml) — `grep -r your-domain .`
- [ ] Цифры `[XX]` в блоке «Знакомство»: замените текст и добавьте число в `data-count="25"` — оно будет анимироваться.
- [ ] Адрес офиса `[улица, дом]` (index.html + JSON-LD), ссылку «Построить маршрут».
- [ ] Ссылки на Telegram и Instagram в подвале (`href="#"`).
- [ ] Логотипы клиентов в блоке «Наши клиенты».
- [ ] Год основания / история в блоке «Знакомство», `[X]` часов/минут в текстах.

## Фотографии

Фото в `assets/img/photos/` сгенерированы в ElevenLabs (модель Seedream 5 Lite) и сохранены в WebP в двух размерах — 960 и 1920 px (`srcset`):

| Файл | Где на сайте |
|---|---|
| `hero-*` | первый экран |
| `road-*`, `border-*`, `warehouse-*`, `customs-*` | карточки услуг |
| `driver-*` | блок «Уверенность в деталях» |
| `dock-*` | фон блока заявки |

Чтобы заменить на реальные фото автопарка — сохраните свои файлы с теми же именами (16:9, 960 и 1920 px). Карта офиса пока заглушка: замените `.office__map` на встраиваемую карту Яндекс/Google.

## Контакты на сайте

- Телефон: +998 99 523 27 05
- Email: uz.silkroad@mail.ru
