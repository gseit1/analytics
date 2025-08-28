<template>
  <div class="app-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <Sidebar class="sidebar" :collapsed="sidebarCollapsed" />
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <button class="sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed" aria-label="Toggle sidebar">
        <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
      </button>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'

const sidebarCollapsed = ref(false)
</script>

<style>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
  transition: all 0.2s;
}

.sidebar {
  width: 240px;
  min-width: 200px;
  background: #222;
  color: #fff;
  transition: width 0.2s;
  /* ...add your sidebar styles... */
}

.sidebar[collapsed], .app-layout.sidebar-collapsed .sidebar {
  width: 60px !important;
  min-width: 60px !important;
  overflow-x: hidden;
}

.main-content {
  flex: 1 1 0;
  padding: 24px;
  background: #f8f9fa;
  min-width: 0;
  overflow-x: auto;
  transition: margin-left 0.2s, padding 0.2s;
  position: relative;
}

.sidebar-toggle {
  position: absolute;
  top: 16px;
  left: -16px;
  z-index: 10;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  cursor: pointer;
  transition: left 0.2s;
}

.app-layout.sidebar-collapsed .main-content .sidebar-toggle {
  left: -16px;
}

@media (max-width: 900px) {
  .sidebar {
    width: 100vw !important;
    min-width: 0 !important;
    min-height: 60px;
    position: relative;
    z-index: 20;
  }
  .main-content {
    padding: 12px;
    margin-left: 0 !important;
  }
  .sidebar-toggle {
    left: 8px;
    top: 8px;
  }
}

@media (min-width: 900px) {
  .main-content {
    margin-left: 240px;
  }
  .app-layout.sidebar-collapsed .main-content {
    margin-left: 60px;
  }
}
</style>
