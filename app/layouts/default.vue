<script setup lang="ts">
const sidebarOpen = ref(true)

interface NavSection {
  title: string
  basePath: string
  items: { label: string; to: string }[]
}

const navigation: NavSection[] = [
  {
    title: 'Grundlagen',
    basePath: '/grundlagen',
    items: [
      { label: 'Übersicht', to: '/grundlagen' },
      { label: 'Lagemaße', to: '/grundlagen/lagemasse' },
      { label: 'Streuung', to: '/grundlagen/streuung' },
      { label: 'Verteilungen', to: '/grundlagen/verteilungen' },
      { label: 'Korrelation', to: '/grundlagen/korrelation' },
    ],
  },
  {
    title: 'Regression',
    basePath: '/regression',
    items: [
      { label: 'Übersicht', to: '/regression' },
      { label: 'Einfache Regression', to: '/regression/einfach' },
      { label: 'Multiple Regression', to: '/regression/multipel' },
    ],
  },
  {
    title: 'Statistische Tests',
    basePath: '/tests',
    items: [
      { label: 'Übersicht', to: '/tests' },
      { label: 'p-Wert', to: '/tests/p-wert' },
      { label: 'T-Test', to: '/tests/t-test' },
      { label: 'F-Test', to: '/tests/f-test' },
      { label: 'Grubbs-Test', to: '/tests/grubbs' },
      { label: 'VIF', to: '/tests/vif' },
    ],
  },
  {
    title: 'ML-Modelle',
    basePath: '/modelle',
    items: [
      { label: 'Übersicht', to: '/modelle' },
    ],
  },
]

const route = useRoute()

function isActive(to: string): boolean {
  return route.path === to
}

function isSectionActive(basePath: string): boolean {
  return route.path.startsWith(basePath)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-surface-700 bg-surface-800 transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center gap-3 border-b border-surface-700 px-5">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500 text-sm font-bold text-white">
          S
        </div>
        <span class="text-lg font-semibold tracking-tight">Statistik</span>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto p-4">
        <NuxtLink
          to="/"
          class="mb-4 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
          :class="route.path === '/' ? 'bg-accent-500/15 text-accent-400' : 'text-text-secondary hover:bg-surface-700 hover:text-text-primary'"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </NuxtLink>

        <div v-for="section in navigation" :key="section.title" class="mb-3">
          <h3
            class="mb-1 px-3 text-xs font-semibold uppercase tracking-wider"
            :class="isSectionActive(section.basePath) ? 'text-accent-400' : 'text-text-muted'"
          >
            {{ section.title }}
          </h3>
          <ul>
            <li v-for="item in section.items" :key="item.to">
              <NuxtLink
                :to="item.to"
                class="flex items-center rounded-lg px-3 py-1.5 text-sm transition-colors"
                :class="isActive(item.to) ? 'bg-accent-500/15 text-accent-400' : 'text-text-secondary hover:bg-surface-700 hover:text-text-primary'"
              >
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-1 flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="flex h-16 items-center gap-4 border-b border-surface-700 bg-surface-800/50 px-6">
        <button
          class="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-700 hover:text-text-primary"
          @click="sidebarOpen = !sidebarOpen"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-sm text-text-secondary">
          <NuxtLink to="/" class="hover:text-text-primary">Home</NuxtLink>
          <template v-if="route.path !== '/'">
            <span class="text-text-muted">/</span>
            <span class="text-text-primary">{{ route.meta.title || route.path.split('/').pop() }}</span>
          </template>
        </nav>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-y-auto p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
