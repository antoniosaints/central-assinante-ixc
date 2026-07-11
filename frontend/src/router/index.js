import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/layouts/AppLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { public: true, title: 'Entrar' },
  },
  {
    // Área autenticada — usa o layout com header + bottom bar.
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'inicio',
        component: () => import('@/pages/InicioPage.vue'),
        meta: { title: 'Início', tab: 'inicio' },
      },
      {
        path: 'consumo',
        name: 'consumo',
        component: () => import('@/pages/ConsumoPage.vue'),
        meta: { title: 'Consumo', tab: 'consumo' },
      },
      {
        path: 'dispositivos',
        name: 'dispositivos',
        component: () => import('@/pages/DispositivosPage.vue'),
        meta: { title: 'Dispositivos', tab: 'dispositivos' },
      },
      {
        path: 'relatorios',
        name: 'relatorios',
        component: () => import('@/pages/RelatoriosPage.vue'),
        meta: { title: 'Relatórios', tab: 'relatorios' },
      },
      {
        path: 'meus-dados',
        name: 'meus-dados',
        component: () => import('@/pages/MeusDadosPage.vue'),
        meta: { title: 'Meus Dados' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Guard de autenticação.
router.beforeEach((to) => {
  const auth = useAuthStore();
  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { path: '/' };
  }
});

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · Central do Assinante`
    : 'Central do Assinante';
});

export default router;
