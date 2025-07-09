<template>
  <div id="app">
    <Navbar v-if="!isAuthPage" />
    <main :class="{ 'container-fluid': !isAuthPage, 'p-0': isAuthPage }">
      <router-view />
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
