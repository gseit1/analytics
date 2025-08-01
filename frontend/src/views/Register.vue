<template>
  <div class="auth-container">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <i class="bi bi-graph-up-arrow text-primary" style="font-size: 3rem;"></i>
                <h2 class="mt-3">Create Account</h2>
                <p class="text-muted">Set up your job analytics dashboard</p>
              </div>

              <form @submit.prevent="handleRegister">
                <div class="mb-3">
                  <label class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.username"
                    :class="{ 'is-invalid': errors.username }"
                    required
                  >
                  <div v-if="errors.username" class="invalid-feedback">
                    {{ errors.username }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="form.email"
                    :class="{ 'is-invalid': errors.email }"
                    required
                  >
                  <div v-if="errors.email" class="invalid-feedback">
                    {{ errors.email }}
                  </div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    v-model="form.password"
                    :class="{ 'is-invalid': errors.password }"
                    required
                  >
                  <div v-if="errors.password" class="invalid-feedback">
                    {{ errors.password }}
                  </div>
                </div>

                <div class="mb-4">
                  <label class="form-label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    class="form-control"
                    v-model="form.hourlyRate"
                    :class="{ 'is-invalid': errors.hourlyRate }"
                    placeholder="15.00"
                  >
                  <div class="form-text">Your current hourly wage (can be changed later)</div>
                  <div v-if="errors.hourlyRate" class="invalid-feedback">
                    {{ errors.hourlyRate }}
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 mb-3"
                  :disabled="loading"
                >
                  <span v-if="loading" class="loading me-2"></span>
                  {{ loading ? 'Creating Account...' : 'Create Account' }}
                </button>
              </form>

              <div class="text-center">
                <p class="mb-0">
                  Already have an account?
                  <router-link to="/login" class="text-primary">Sign in</router-link>
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
  name: 'Register',
  setup () {
    const router = useRouter()
    const toast = useToast()
    const { register } = authStore()

    const form = ref({
      username: '',
      email: '',
      password: '',
      hourlyRate: 15.00
    })

    const errors = ref({})
    const loading = ref(false)

    const handleRegister = async () => {
      errors.value = {}
      loading.value = true

      try {
        const result = await register(form.value)

        if (result.success) {
          toast.success('Account created successfully! Welcome!')
          router.push('/')
        } else {
          toast.error(result.message)
        }
      } catch (error) {
        toast.error('An error occurred during registration')
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      errors,
      loading,
      handleRegister
    }
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border: none;
  border-radius: 1rem;
}
</style>
