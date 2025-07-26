<template>
  <div id="app">
    <Navbar v-if="!isAuthPage" />
    <main :class="{ 
      'main-content': !isAuthPage, 
      'auth-main': isAuthPage 
    }">
      <div class="page-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  components: {
    Navbar
  },
  setup () {
    const route = useRoute()

    const isAuthPage = computed(() => {
      return route.path === '/login' || route.path === '/register'
    })

    return {
      isAuthPage
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--space-xl) var(--space-lg);
  background: linear-gradient(135deg, var(--gray-50) 0%, #ffffff 100%);
}

.auth-main {
  flex: 1;
  padding: 0;
}

.page-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .main-content {
    padding: var(--space-lg) var(--space-md);
  }
}
</style>
