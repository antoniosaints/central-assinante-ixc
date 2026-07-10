<script setup>
/**
 * Container padrão das páginas: aplica a largura de "app", o espaçamento
 * inferior para não ficar atrás da BottomBar e a animação de entrada.
 */
</script>

<template>
  <div class="animate-fade-in space-y-1 px-4 pb-28 pt-4 md:mx-auto md:w-full md:max-w-[76rem] md:px-8 md:pb-12 md:pt-7 xl:px-10">
    <slot />
  </div>
</template>
