/**
 * Diretiva-função de ripple para botões (efeito Material/nativo).
 * Uso: @pointerdown="ripple" em um elemento com a classe `ripple-host`.
 */
export function useRipple() {
  function ripple(event) {
    const host = event.currentTarget;
    if (!host) return;

    const rect = host.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const dot = document.createElement('span');
    dot.className = 'ripple-dot';
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${event.clientX - rect.left - size / 2}px`;
    dot.style.top = `${event.clientY - rect.top - size / 2}px`;

    host.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove());
  }

  return { ripple };
}
