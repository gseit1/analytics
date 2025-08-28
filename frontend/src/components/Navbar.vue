<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <router-link class="navbar-brand" to="/">
        <i class="bi bi-graph-up-arrow me-2"></i>
        Job Analytics
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" to="/">
              <i class="bi bi-speedometer2 me-1"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/work">
              <i class="bi bi-clock me-1"></i>
              Work Log
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/expenses">
              <i class="bi bi-wallet2 me-1"></i>
              Expenses
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/schedule">
              <i class="bi bi-calendar-week me-1"></i>
              Schedule
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/calendar">
              <i class="bi bi-calendar3 me-1"></i>
              Calendar
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/goals">
              <i class="bi bi-bullseye me-1"></i>
              Goals
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/customization">
              <i class="bi bi-sliders me-1"></i>
              Customization
            </router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/statistics">
              <i class="bi bi-bar-chart me-1"></i>
              Statistics
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
            >
              <i class="bi bi-person-circle me-1"></i>
              {{ user?.username }}
            </a>
            <ul class="dropdown-menu">
              <li>
                <router-link class="dropdown-item" to="/profile">
                  <i class="bi bi-gear me-2"></i>
                  Profile Settings
                </router-link>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item" href="#" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i>
                  Logout
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { authStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Navbar',
  setup () {
    const { user, logout } = authStore()
    const router = useRouter()
    const toast = useToast()

    const handleLogout = () => {
      logout()
      router.push('/login')
      toast.success('Logged out successfully')
    }

    return {
      user,
      handleLogout
    }
  }
}
</script>
