// Service Worker для PWA
// Версія: 1.0
const CACHE_NAME = "gantt-pro-v1";
const URLS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js",
];

// Встановлення Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Кеш відкрит");
        return cache.addAll(URLS_TO_CACHE).catch((err) => {
          console.warn("Деякі файли не кешовані:", err);
          // Додаємо файли, які є локально
          return cache.add("./").catch(() => {});
        });
      })
      .then(() => self.skipWaiting()),
  );
});

// Активація Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Видалення старого кешу:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Стратегія: спочатку кеш (Cache First), потім мережа (Network)
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ігноруємо не-GET запити
  if (request.method !== "GET") {
    return;
  }

  // Стратегія Cache First для статичних ресурсів
  if (
    request.url.includes("chart.js") ||
    request.url.endsWith(".html") ||
    request.url.endsWith(".json")
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request)
          .then((response) => {
            // Не кешуємо помилки
            if (!response || response.status !== 200) {
              return response;
            }

            // Кешуємо успішні відповіді
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });

            return response;
          })
          .catch(() => {
            // Офлайн режим - повертаємо кешовану версію або offline-сторінку
            return caches.match(request).then((response) => {
              if (response) return response;
              // Если это HTML, пытаемся вернуть главную страницу
              if (
                request.destination === "" ||
                request.destination === "document"
              ) {
                return caches.match("./index.html");
              }
              return new Response("Офлайн режим. Ресурс недоступний.", {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({
                  "Content-Type": "text/plain; charset=utf-8",
                }),
              });
            });
          });
      }),
    );
  } else {
    // Network First для інших запитів
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((response) => {
            if (response) return response;
            return new Response("Ресурс недоступний у офлайн режимі", {
              status: 503,
              statusText: "Service Unavailable",
            });
          });
        }),
    );
  }
});

// Обробка фонових синхронізацій (якщо потрібна)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(
      // Тут можна додати логіку синхронізації даних
      Promise.resolve(),
    );
  }
});

console.log("Service Worker завантажений");
