# The Logistika Holding — сайт

Лендинг транспортной компании The Logistika Holding (Ташкент). Статический сайт: HTML + CSS + чистый JavaScript, без сборки. Заявки с формы уходят в Telegram через serverless-функцию Vercel.

## Структура

```
index.html              — главная страница (RU), SEO-мета, Open Graph, JSON-LD
404.html                — страница «не найдено»
api/lead.js             — Vercel Function: POST /api/lead → сообщение в Telegram
assets/css/styles.css   — стили (mobile-first, брендбук)
assets/js/main.js       — меню, анимации, вкладки услуг, интерактивная карта, формы
assets/fonts/           — Inter (self-hosted, кириллица + латиница)
assets/img/             — логотипы, favicon, иконки, og-image.jpg
robots.txt, sitemap.xml, site.webmanifest, vercel.json
```

## Локальный просмотр

```bash
npx serve .            # или: python3 -m http.server 8000
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

Сейчас вместо фото стоят тёмные заглушки с подписями `[Фото: …]`.

- **Hero:** положите фото в `assets/img/hero.jpg` (рекомендуется 2560×1440, ≤ 400 КБ, WebP/JPEG) — сайт подхватит его автоматически.
- Остальные заглушки — элементы `.card`, `.why__photo`, `.contact__box`: замените градиент `--bg`/`background` на `url(...)`.

## Контакты на сайте

- Телефон: +998 99 523 27 05
- Email: uz.silkroad@mail.ru
