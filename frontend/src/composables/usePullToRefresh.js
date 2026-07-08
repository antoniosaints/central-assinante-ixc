import { ref } from 'vue';

/**
 * Estrutura preparada para "pull to refresh".
 * Detecta o arraste para baixo no topo do container e dispara onRefresh.
 *
 * @param {() => Promise<any>} onRefresh
 * @param {{ threshold?: number }} options
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 70 } = options;
  const pullDistance = ref(0);
  const isRefreshing = ref(false);

  let startY = 0;
  let pulling = false;

  function onTouchStart(e) {
    // Só ativa quando o scroll está no topo.
    if (window.scrollY > 0) return;
    startY = e.touches[0].clientY;
    pulling = true;
  }

  function onTouchMove(e) {
    if (!pulling || isRefreshing.value) return;
    const delta = e.touches[0].clientY - startY;
    if (delta > 0) {
      // Resistência para dar sensação elástica.
      pullDistance.value = Math.min(delta * 0.5, threshold + 20);
    }
  }

  async function onTouchEnd() {
    if (!pulling) return;
    pulling = false;
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true;
      try {
        await onRefresh();
      } finally {
        isRefreshing.value = false;
      }
    }
    pullDistance.value = 0;
  }

  return {
    pullDistance,
    isRefreshing,
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
  };
}
