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
        @click="toggleNavbar"
        ref="navbarToggler"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav" ref="navbarMenu">
        <ul class="navbar-nav me-auto">
          <li class="nav-item" @click="closeNavbar">
            <router-link class="nav-link" to="/">
              <i class="bi bi-speedometer2 me-1"></i>
              Dashboard
            </router-link>
          </li>
          <li class="nav-item" @click="closeNavbar">
            <router-link class="nav-link" to="/work">
              <i class="bi bi-clock me-1"></i>
              Work Log
            </router-link>
          </li>
          <li class="nav-item" @click="closeNavbar">
            <router-link class="nav-link" to="/expenses">
              <i class="bi bi-wallet2 me-1"></i>
              Expenses
            </router-link>
          </li>
          <li class="nav-item" @click="closeNavbar">
            <router-link class="nav-link" to="/schedule">
              <i class="bi bi-calendar-week me-1"></i>
              Schedule
            </router-link>
          </li>
          <li class="nav-item" @click="closeNavbar">
            <router-link class="nav-link" to="/statistics">
              <i class="bi bi-bar-chart me-1"></i>
              Statistics
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <li class="nav-item dropdown" ref="profileDropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              @click.prevent="toggleProfileDropdown"
            >
              <i class="bi bi-person-circle me-1"></i>
              {{ user?.username }}
            </a>
            <ul class="dropdown-menu" :class="{ show: profileDropdownOpen }">
              <li>
                <router-link class="dropdown-item" to="/profile" @click="closeAllMenus">
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { authStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

export default {
  name: 'Navbar',
  setup () {
    const { user, logout } = authStore()
    const router = useRouter()
    const toast = useToast()
    
    const navbarToggler = ref(null)
    const navbarMenu = ref(null)
    const profileDropdown = ref(null)
    const profileDropdownOpen = ref(false)
    const isNavbarOpen = ref(false)
    
    // Close navbar when clicking outside
    const handleClickOutside = (event) => {
      if (
        isNavbarOpen.value && 
        navbarMenu.value && 
        !navbarMenu.value.contains(event.target) && 
        !navbarToggler.value.contains(event.target)
      ) {
        closeNavbar()
      }
      
      if (
        profileDropdownOpen.value && 
        profileDropdown.value && 
        !profileDropdown.value.contains(event.target)
      ) {
        profileDropdownOpen.value = false
      }
    }
    
    const toggleNavbar = () => {
      isNavbarOpen.value = !isNavbarOpen.value
      if (navbarMenu.value) {
        if (isNavbarOpen.value) {
          navbarMenu.value.classList.add('show')
        } else {
          navbarMenu.value.classList.remove('show')
        }
      }
    }
    
    const closeNavbar = () => {
      if (navbarMenu.value && navbarMenu.value.classList.contains('show')) {
        isNavbarOpen.value = false
        navbarMenu.value.classList.remove('show')
      }
    }
    
    const toggleProfileDropdown = () => {
      profileDropdownOpen.value = !profileDropdownOpen.value
    }
    
    const closeAllMenus = () => {
      closeNavbar()
      profileDropdownOpen.value = false
    }

    const handleLogout = () => {
      closeAllMenus()
      logout()
      router.push('/login')
      toast.success('Logged out successfully')
    }
    
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      user,
      handleLogout,
      navbarToggler,
      navbarMenu,
      profileDropdown,
      profileDropdownOpen,
      isNavbarOpen,
      toggleNavbar,
      closeNavbar,
      toggleProfileDropdown,
      closeAllMenus
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #343a40;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown-menu.show {
  display: block;
  animation: fadeIn 0.2s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  position: relative;
}

.dropdown-menu {
  right: 0;
  left: auto;
  margin-top: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  border-radius: 6px;
  padding: 8px 0;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 0.9rem;
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  opacity: 0.7;
}

@media (max-width: 992px) {
  .dropdown-menu {
    position: static !important;
    float: none;
    width: 100%;
    margin-top: 0;
    background-color: transparent;
    border: none;
    box-shadow: none;
    padding-left: 1.5rem;
  }
  
  .dropdown-item {
    color: rgba(255, 255, 255, 0.8) !important;
  }
  
  .dropdown-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white !important;
  }
  
  .dropdown-divider {
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .navbar-nav .nav-link {
    padding: 0.8rem 0;
  }
  
  .nav-item {
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .nav-item:last-child {
    border-bottom: none;
  }
}

.nav-link {
  position: relative;
  transition: all 0.2s;
}

.router-link-active {
  color: white !important;
}

.router-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ffffff;
  transform: scaleX(1);
}

.nav-link:not(.router-link-active)::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
  transform: scaleX(0);
  transition: transform 0.3s;
}

.nav-link:not(.router-link-active):hover::after {
  transform: scaleX(0.8);
}

@media (max-width: 992px) {
  .nav-link::after,
  .nav-link:hover::after,
  .router-link-active::after {
    display: none;
  }
  
  .router-link-active {
    background-color: rgba(255, 255, 255, 0.1);
    padding-left: 0.5rem !important;
    border-radius: 4px;
  }
}
</style>
