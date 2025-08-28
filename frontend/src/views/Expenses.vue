<template>
  <div class="container-fluid py-4 expenses-page">
    <div class="row">
      <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h1 class="h3 mb-0">Expenses & Income</h1>
          <button class="btn btn-primary" @click="showAddModal">
            <i class="bi bi-plus-circle me-2"></i>Add Transaction
          </button>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row mb-4">
      <div class="col-md-4 col-12 mb-3 mb-md-0">
        <div class="card stats-card success">
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
      </div>
      <div class="col-md-4 col-12 mb-3 mb-md-0">
        <div class="card stats-card danger">
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
      </div>
      <div class="col-md-4 col-12">
        <div class="card stats-card" :class="summary.net >= 0 ? 'success' : 'danger'">
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

    <!-- Add/Edit Expense Modal -->
    <div class="modal fade" id="expenseModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ editingExpense ? 'Edit Transaction' : 'Add Transaction' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveExpense">
              <div class="mb-3">
                <label class="form-label">Type</label>
                <select class="form-select" v-model="expenseForm.type" required>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Date</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="expenseForm.expenseDate"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="expenseForm.description"
                  placeholder="e.g., Groceries, Freelance work"
                  required
                >
              </div>
              <div class="mb-3">
                <label class="form-label">Category</label>
                <input
                  type="text"
                  class="form-control"
                  v-model="expenseForm.category"
                  placeholder="e.g., Food, Transportation, Consulting"
                  list="categories"
                  required
                >
                <datalist id="categories">
                  <option v-for="category in categories" :key="category" :value="category" />
                </datalist>
              </div>
              <div class="mb-3">
                <label class="form-label">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  class="form-control"
                  v-model="expenseForm.amount"
                  required
                >
              </div>
              <div class="text-end">
                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" class="btn btn-primary" :disabled="savingExpense">
                  {{ savingExpense ? 'Saving...' : 'Save' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import api from '@/services/api'
import { format } from 'date-fns'
import { formatEuroAmount } from '@/utils/currency'

export default {
  name: 'Expenses',
  setup () {
    const toast = useToast()

    const loading = ref(false)
    const expenses = ref([])
    const categories = ref([])
    const summary = ref({ income: 0, expense: 0, net: 0 })
    const pagination = ref({ page: 1, totalPages: 1, total: 0 })
    const editingExpense = ref(null)
    const savingExpense = ref(false)

    const filters = ref({
      type: '',
      category: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    })

    const expenseForm = ref({
      type: 'expense',
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      category: '',
      amount: ''
    })

    const months = [
      { value: 1, label: 'January' },
      { value: 2, label: 'February' },
      { value: 3, label: 'March' },
      { value: 4, label: 'April' },
      { value: 5, label: 'May' },
      { value: 6, label: 'June' },
      { value: 7, label: 'July' },
      { value: 8, label: 'August' },
      { value: 9, label: 'September' },
      { value: 10, label: 'October' },
      { value: 11, label: 'November' },
      { value: 12, label: 'December' }
    ]

    const years = computed(() => {
      const currentYear = new Date().getFullYear()
      return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
    })

    const visiblePages = computed(() => {
      const total = pagination.value.totalPages
      const current = pagination.value.page
      const pages = []

      for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
        pages.push(i)
      }
      return pages
    })

    const formatDate = (dateString) => {
      return format(new Date(dateString), 'MMM dd, yyyy')
    }

    const fetchExpenses = async (page = 1) => {
      loading.value = true
      try {
        const params = { page, limit: 30 }
        Object.keys(filters.value).forEach(key => {
          if (filters.value[key]) {
            params[key] = filters.value[key]
          }
        })

        const response = await api.get('/expenses', { params })
        expenses.value = response.data.expenses
        pagination.value = response.data.pagination

        // Calculate summary
        calculateSummary()
      } catch (error) {
        console.error('Error fetching expenses:', error)
        toast.error('Failed to load expenses')
      } finally {
        loading.value = false
      }
    }

    const calculateSummary = () => {
      const income = expenses.value
        .filter(e => e.type === 'income')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)

      const expense = expenses.value
        .filter(e => e.type === 'expense')
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)

      summary.value = {
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        net: (income - expense).toFixed(2)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await api.get('/expenses/categories')
        categories.value = response.data
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        fetchExpenses(page)
      }
    }

    const showAddModal = () => {
      editingExpense.value = null
      expenseForm.value = {
        type: 'expense',
        expenseDate: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        category: '',
        amount: ''
      }
      const modal = new window.Modal(document.getElementById('expenseModal'))
      modal.show()
    }

    const editExpense = (expense) => {
      editingExpense.value = expense
      expenseForm.value = {
        type: expense.type,
        expenseDate: format(new Date(expense.expense_date), 'yyyy-MM-dd'),
        description: expense.description,
        category: expense.category,
        amount: expense.amount
      }
      const modal = new window.Modal(document.getElementById('expenseModal'))
      modal.show()
    }

    const saveExpense = async () => {
      savingExpense.value = true
      try {
        const data = {
          type: expenseForm.value.type,
          expenseDate: expenseForm.value.expenseDate,
          description: expenseForm.value.description,
          category: expenseForm.value.category,
          amount: parseFloat(expenseForm.value.amount)
        }

        if (editingExpense.value) {
          await api.put(`/expenses/${editingExpense.value.id}`, data)
          toast.success('Transaction updated successfully')
        } else {
          await api.post('/expenses', data)
          toast.success('Transaction added successfully')
        }

        const modal = window.Modal.getInstance(document.getElementById('expenseModal'))
        modal.hide()
        await fetchExpenses(pagination.value.page)
        await fetchCategories()
      } catch (error) {
        console.error('Error saving expense:', error)
        toast.error(error.response?.data?.message || 'Failed to save transaction')
      } finally {
        savingExpense.value = false
      }
    }

    const deleteExpense = async (expense) => {
      if (confirm(`Are you sure you want to delete this ${expense.type}?`)) {
        try {
          await api.delete(`/expenses/${expense.id}`)
          toast.success('Transaction deleted successfully')
          await fetchExpenses(pagination.value.page)
        } catch (error) {
          console.error('Error deleting expense:', error)
          toast.error('Failed to delete transaction')
        }
      }
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
  .row.mb-4 > div {
    margin-bottom: 1rem !important;
  }
}
</style>
                  