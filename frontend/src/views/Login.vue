<template>
  <div class="auth-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card auth-card hover-lift">
            <div class="card-body p-5">
              <div class="text-center mb-5">
                <div class="auth-icon mb-4">
                  <i class="bi bi-graph-up-arrow"></i>
                </div>
                <h2 class="gradient-text mb-2">Welcome Back</h2>
                <p class="text-muted">Sign in to your account to continue</p>
              </div>

              <form @submit.prevent="handleLogin" class="auth-form">
                <div class="mb-4">
                  <label class="form-label">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input
                      type="email"
                      class="form-control"
                      v-model="form.email"
                      :class="{ 'is-invalid': errors.email }"
                      placeholder="Enter your email"
                      required
                    >
                  </div>
                  <div v-if="errors.email" class="invalid-feedback d-block">
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label">Password</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      class="form-control"
                      v-model="form.password"
                      :class="{ 'is-invalid': errors.password }"
                      placeholder="Enter your password"
                      required
                    >
                  </div>
                  <div v-if="errors.password" class="invalid-feedback d-block">
                    {{ errors.password }}
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-4 btn-lg"
                  :disabled="loading"
                >
                  <span v-if="loading" class="loading me-2"></span>
                  <i v-if="!loading" class="bi bi-box-arrow-in-right me-2"></i>
                  {{ loading ? 'Signing In...' : 'Sign In' }}
                </button>
              </form>

              <div class="text-center">
                <p class="mb-0">
                  Don't have an account?
                  <router-link to="/register" class="text-primary fw-bold text-decoration-none">
                    Create Account
                  </router-link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { authStore } from '@/stores/auth'

export default {
  name: 'Login',
  setup () {
    const router = useRouter()
    const toast = useToast()
    const { login } = authStore()

    const form = ref({
      email: '',
      password: ''
    })

    const errors = ref({})
    const loading = ref(false)

    const handleLogin = async () => {
      errors.value = {}
      loading.value = true

      try {
        const result = await login(form.value.email, form.value.password)

        if (result.success) {
          toast.success('Welcome back!')
          router.push('/')
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('An error occurred during login')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.auth-icon {
  width: 4rem;
  height: 4rem;
  background: var(--gradient-primary);
  border-radius: var(--border-radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: var(--shadow-lg);
}

.auth-icon i {
  font-size: 2rem;
  color: white;
}

.auth-form .input-group {
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.auth-form .input-group:focus-within {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.auth-form .input-group-text {
  background: var(--gradient-subtle);
  border: 2px solid var(--gray-200);
  border-right: none;
  color: var(--primary-600);
  font-weight: 600;
}

.auth-form .form-control {
  border: 2px solid var(--gray-200);
  border-left: none;
}

.auth-form .input-group:focus-within .input-group-text {
  background: var(--primary-50);
  border-color: var(--primary-500);
  color: var(--primary-700);
}

.auth-form .input-group:focus-within .form-control {
  border-color: var(--primary-500);
  box-shadow: none;
}

.auth-card {
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-container {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
