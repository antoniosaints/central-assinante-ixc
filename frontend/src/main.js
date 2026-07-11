import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './style.css';

createApp(App).use(createPinia()).use(router).mount('#app');

/**
 * Mantém a cor da status bar (meta theme-color) igual ao topo do header, que
 * usa `primary-dark`. Lê a cor efetiva (mesmo quando a primária é customizada
 * via VITE_PRIMARY_COLOR) de um elemento-sonda com a classe Tailwind gerada.
 */
(function syncThemeColor() {
  const probe = document.createElement('span');
  probe.className = 'bg-primary-dark';
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const cor = getComputedStyle(probe).backgroundColor;
  probe.remove();
  if (!cor) return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', cor);
})();

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.error('Erro ao registrar o service worker:', error);
    });
  });
}
