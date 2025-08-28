<template>
  <aside :class="['sidebar', { collapsed, mobile: isMobile }]" @transitionend="emitSidebarState" >
    <div class="sidebar-header">
      <button class="sidebar-toggle" @click="toggleSidebar">
        <i :class="collapsed ? 'bi bi-list' : 'bi bi-x-lg'"></i>
      </button>
      <span v-if="!collapsed && !isMobile" class="sidebar-title">JobAnalytics</span>
    </div>
    <nav class="sidebar-nav" :class="{ collapsed }">
      <div class="sidebar-header">
        <span v-if="!collapsed" class="sidebar-title">JobAnalytics</span>
        <span v-else class="sidebar-title-collapsed"><i class="bi bi-graph-up"></i></span>
      </div>
      <router-link v-for="item in navItems" :key="item.to" :to="item.to" class="sidebar-link" active-class="active">
        <i :class="item.icon"></i>
        <span v-if="!collapsed" class="sidebar-link-text">{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>

import { ref, onMounted, onUnmounted, watch, nextTick, defineEmits } from 'vue'

const emit = defineEmits(['sidebar-state'])

const collapsed = ref(false)
const isMobile = ref(false)
const navItems = [
  { to: '/', label: 'Dashboard', icon: 'bi bi-speedometer2' },
  { to: '/calendar', label: 'Calendar', icon: 'bi bi-calendar3' },
  { to: '/goals', label: 'Goals', icon: 'bi bi-bullseye' },
  { to: '/customization', label: 'Customization', icon: 'bi bi-sliders' },
  { to: '/work', label: 'Work', icon: 'bi bi-briefcase' },
  { to: '/expenses', label: 'Expenses', icon: 'bi bi-wallet2' },
  { to: '/schedule', label: 'Schedule', icon: 'bi bi-calendar-week' },
  { to: '/statistics', label: 'Statistics', icon: 'bi bi-bar-chart' },
  { to: '/profile', label: 'Profile', icon: 'bi bi-person-circle' },
]

function toggleSidebar() {
  collapsed.value = !collapsed.value
  emitSidebarState()
}

function handleResize() {
  isMobile.value = window.innerWidth < 900
  if (isMobile.value) collapsed.value = false
  emitSidebarState()
}

function emitSidebarState() {
  emit('sidebar-state', { collapsed: collapsed.value, mobile: isMobile.value })
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
watch([collapsed, isMobile], () => {
  nextTick(() => emitSidebarState())
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 220px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: width 0.25s, box-shadow 0.25s;
  box-shadow: 2px 0 12px 0 rgba(60,72,88,0.08);
}
.sidebar.collapsed {
  width: 60px;
}
.sidebar.mobile {
  position: fixed;
  width: 100vw;
  height: 56px;
  flex-direction: row;
  align-items: center;
  bottom: 0;
  top: auto;
  left: 0;
  right: 0;
  box-shadow: 0 -2px 12px 0 rgba(60,72,88,0.08);
}
.sidebar-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.2rem 1rem 1.2rem;
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
}
.sidebar-toggle {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  outline: none;
  margin-right: 0.5rem;
}
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 24px 12px;
  height: 100%;
  box-sizing: border-box;
  transition: width 0.2s;
  align-items: flex-start;
}
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 1.2rem;
  color: #fff;
  text-decoration: none;
  font-size: 1.05rem;
  border-radius: 8px 0 0 8px;
  transition: background 0.18s, color 0.18s;
  opacity: 0.92;
  width: 100%;
  box-sizing: border-box;
}
.sidebar-link.active, .sidebar-link:hover {
  background: rgba(255,255,255,0.13);
  color: #fff;
  opacity: 1;
}
.sidebar-link i {
  font-size: 1.25rem;
}
.collapsed .sidebar-link-text {
  display: none;
}
.collapsed {
  align-items: center;
  padding: 16px 0 0 0;
}
@media (max-width: 900px) {
  .sidebar {
    width: 100vw;
    height: 56px;
    flex-direction: row;
    align-items: center;
    bottom: 0;
    top: auto;
    left: 0;
    right: 0;
    box-shadow: 0 -2px 12px 0 rgba(60,72,88,0.08);
  }
  .sidebar-header {
    padding: 0.7rem 1rem;
    font-size: 1rem;
  }
  .sidebar-nav {
    flex-direction: row;
    gap: 0.2rem;
    margin-top: 0;
    width: 100%;
    justify-content: space-around;
    padding: 8px;
    align-items: center;
  }
  .sidebar-link {
    border-radius: 8px;
    padding: 0.7rem 0.7rem;
    font-size: 0.98rem;
    justify-content: center;
  }
}
</style>
