export function startServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    const onLoad = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope)
        })
        .catch((error: unknown) => {
          console.log('ServiceWorker registration failed: ', error)
        })
    }

    // `load` случается один раз, поэтому handler делаем одноразовым.
    // Это предотвращает потенциальное накопление обработчиков при повторных инициализациях.
    window.addEventListener('load', onLoad, { once: true })
  }
}
