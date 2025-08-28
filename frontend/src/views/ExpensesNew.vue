<template>
  <div class="page-content expenses-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0">Expenses & Income (New)</h1>
      <button class="btn btn-primary" @click="showAddModal">
        <i class="bi bi-plus-circle me-2"></i>Add Transaction
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="expenses-summary-cards d-flex flex-wrap gap-3 mb-4">
      <div class="card stats-card success flex-fill">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <div class="stats-label">Total Income</div>
              <div class="stats-value">€{{ formatEuroAmount(summary.income || 0) }}</div>
            </div>
            <div class="text-success">
              <i class="bi bi-arrow-up-circle" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="card stats-card danger flex-fill">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <div class="stats-label">Total Expenses</div>
              <div class="stats-value">€{{ formatEuroAmount(summary.expense || 0) }}</div>
            </div>
            <div class="text-danger">
              <i class="bi bi-arrow-down-circle" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="card stats-card flex-fill" :class="summary.net >= 0 ? 'success' : 'danger'">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <div class="stats-label">Net Income</div>
              <div class="stats-value">€{{ formatEuroAmount(summary.net || 0) }}</div>
            </div>
            <div :class="`text-${summary.net >= 0 ? 'success' : 'danger'}`">
              <i class="bi bi-graph-up" style="font-size: 2rem;"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-lg-8 col-12 mb-3 mb-lg-0">
        <div class="card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Type</label>
                <select class="form-select" v-model="filters.type" @change="fetchExpenses">
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Category</label>
                <select class="form-select" v-model="filters.category" @change="fetchExpenses">
                  <option value="">All Categories</option>
                  <option v-for="category in categories" :key="category" :value="category">
                    {{ category }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Month</label>
                <select class="form-select" v-model="filters.month" @change="fetchExpenses">
                  <option value="">All Months</option>
                  <option v-for="month in months" :key="month.value" :value="month.value">
                    {{ month.label }}
                  </option>
                </select>
              </div>
              <div class="col-md-3">
                <label class="form-label">Year</label>
                <select class="form-select" v-model="filters.year" @change="fetchExpenses">
                  <option v-for="year in years" :key="year" :value="year">{{ year }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Transactions</h5>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
            <div v-else-if="expenses.length === 0" class="text-center py-4">
              <i class="bi bi-receipt text-muted" style="font-size: 3rem;"></i>
              <p class="text-muted mt-2">No transactions found</p>
              <button class="btn btn-primary" @click="showAddModal">Add Your First Transaction</button>
            </div>
            <div v-else>
              <div class="table-responsive expenses-table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="expense in expenses" :key="expense.id">
                      <td>{{ formatDate(expense.expense_date) }}</td>
                      <td>{{ expense.description }}</td>
                      <td>{{ expense.category }}</td>
                      <td>
                        <span :class="`badge bg-${expense.type === 'income' ? 'success' : 'danger'}`">
                          {{ expense.type }}
                        </span>
                      </td>
                      <td :class="expense.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'">
                        {{ expense.type === 'income' ? '+' : '-' }}€{{ formatEuroAmount(expense.amount) }}
                      </td>
                      <td>
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" @click="editExpense(expense)">
                            <i class="bi bi-pencil"></i>
                          </button>
                          <button class="btn btn-outline-danger" @click="deleteExpense(expense)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Pagination -->
              <nav v-if="pagination.totalPages > 1" class="mt-4">
                <ul class="pagination justify-content-center">
                  <li class="page-item" :class="{ disabled: pagination.page === 1 }">
                    <button class="page-link" @click="changePage(pagination.page - 1)">Previous</button>
                  </li>
                  <li
                    v-for="page in visiblePages"
                    :key="page"
                    class="page-item"
                    :class="{ active: page === pagination.page }"
                  >
                    <button class="page-link" @click="changePage(page)">{{ page }}</button>
                  </li>
                  <li class="page-item" :class="{ disabled: pagination.page === pagination.totalPages }">
                    <button class="page-link" @click="changePage(pagination.page + 1)">Next</button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { format } from 'date-fns'

export default {
  name: 'ExpensesNew',
  setup () {
    const toast = useToast()
    const loading = ref(false)
    const expenses = ref([])
    const categories = ref([])
    const summary = ref({ income: 0, expense: 0, net: 0 })
    const pagination = ref({ page: 1, totalPages: 1 })
    const editingExpense = ref(null)
    const savingExpense = ref(false)
    const filters = ref({ type: '', category: '', month: '', year: '' })
    const expenseForm = ref({ type: 'expense', expenseDate: '', description: '', category: '', amount: '' })
    const months = ref([
      { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
      { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
      { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
      { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ])
    const years = ref([])
    const visiblePages = ref([])

    function formatDate(date) {
      return format(new Date(date), 'yyyy-MM-dd')
    }
    function formatEuroAmount(amount) {
      return amount.toLocaleString('en-US', { minimumFractionDigits: 2 })
    }

    async function fetchExpenses(page = 1) {
      loading.value = true
      try {
        // Fetch expenses, categories, summary, and pagination from API
        // ...API logic here...
      } finally {
        loading.value = false
      }
    }
    async function fetchCategories() {
      // Fetch categories from API
    }
    function showAddModal() {
      // Show add modal logic
    }
    function editExpense(expense) {
      // Edit expense logic
    }
    async function saveExpense() {
      // Save expense logic
    }
    async function deleteExpense(expense) {
      // Delete expense logic
    }
    function changePage(page) {
      // Change page logic
    }

    onMounted(() => {
      fetchExpenses()
      fetchCategories()
    })

    return {
      loading,
      expenses,
      categories,
      summary,
      pagination,
      editingExpense,
      savingExpense,
      filters,
      expenseForm,
      months,
      years,
      visiblePages,
      formatDate,
      formatEuroAmount,
      fetchExpenses,
      changePage,
      showAddModal,
      editExpense,
      saveExpense,
      deleteExpense
    }
  }
}
</script>

<style scoped>
@media (max-width: 900px) {
  .expenses-page {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  .expenses-table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .expenses-summary-cards {
    width: 100%;
    gap: 1rem;
  }
.page-content.expenses-page {
  width: 100%;
  max-width: 100vw;
  box-sizing: border-box;
  padding: 2rem 2vw;
  overflow-x: auto;
}
}
</style>
