<template>
  <div class="interactive-table">
    <div class="table-controls mb-3">
      <div class="row">
        <div class="col-md-6">
          <input
            type="text"
            class="form-control"
            v-model="globalSearch"
            placeholder="🔍 Global search..."
          />
        </div>
        <div class="col-md-6 text-end">
          <span class="text-muted">
            Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredData.length }} entries
          </span>
        </div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead class="table-primary">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              @click="sortBy(column.key)"
              style="cursor: pointer"
            >
              {{ column.label }}
              <i
                class="fas"
                :class="{
                  'fa-sort': sortKey !== column.key,
                  'fa-sort-up': sortKey === column.key && sortOrder === 'asc',
                  'fa-sort-down': sortKey === column.key && sortOrder === 'desc',
                }"
              ></i>
            </th>
          </tr>
          <tr>
            <th v-for="column in columns" :key="'search-' + column.key">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="columnSearch[column.key]"
                :placeholder="`Search ${column.label}...`"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in paginatedData" :key="row.id">
            <td v-for="column in columns" :key="column.key">
              <span v-if="column.key === 'rating'">
                <i
                  v-for="star in 5"
                  :key="star"
                  class="fas fa-star"
                  :class="star <= row.rating ? 'text-warning' : 'text-muted'"
                ></i>
              </span>
              <span
                v-else-if="column.key === 'status'"
                class="badge"
                :class="{
                  'bg-success': row.status === 'Published',
                  'bg-warning': row.status === 'Pending',
                  'bg-secondary': row.status === 'Archived',
                }"
              >
                {{ row[column.key] }}
              </span>
              <span v-else>{{ row[column.key] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination-controls d-flex justify-content-between align-items-center">
      <div>
        <select
          v-model.number="itemsPerPage"
          class="form-select form-select-sm d-inline-block w-auto"
        >
          <option :value="10">10 per page</option>
          <option :value="25">25 per page</option>
          <option :value="50">50 per page</option>
        </select>
      </div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
          </li>
          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InteractiveTable',
  props: {
    data: {
      type: Array,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      globalSearch: '',
      columnSearch: {},
      sortKey: '',
      sortOrder: 'asc',
      currentPage: 1,
      itemsPerPage: 10,
    }
  },
  computed: {
    filteredData() {
      let filtered = this.data

      // Global search
      if (this.globalSearch) {
        const search = this.globalSearch.toLowerCase()
        filtered = filtered.filter((row) => {
          return this.columns.some((column) => {
            const value = String(row[column.key]).toLowerCase()
            return value.includes(search)
          })
        })
      }

      // Column search
      Object.keys(this.columnSearch).forEach((key) => {
        const searchValue = this.columnSearch[key]
        if (searchValue) {
          filtered = filtered.filter((row) => {
            const value = String(row[key]).toLowerCase()
            return value.includes(searchValue.toLowerCase())
          })
        }
      })

      // Sorting
      if (this.sortKey) {
        filtered.sort((a, b) => {
          let aVal = a[this.sortKey]
          let bVal = b[this.sortKey]

          // Handle different data types
          if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase()
            bVal = bVal.toLowerCase()
          }

          if (aVal < bVal) return this.sortOrder === 'asc' ? -1 : 1
          if (aVal > bVal) return this.sortOrder === 'asc' ? 1 : -1
          return 0
        })
      }

      return filtered
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredData.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.itemsPerPage)
    },
    startIndex() {
      return (this.currentPage - 1) * this.itemsPerPage
    },
    endIndex() {
      return Math.min(this.startIndex + this.itemsPerPage, this.filteredData.length)
    },
  },
  methods: {
    sortBy(key) {
      if (this.sortKey === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortOrder = 'asc'
      }
    },
  },
  watch: {
    filteredData() {
      this.currentPage = 1
    },
  },
}
</script>

<style scoped>
.interactive-table {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

thead th {
  user-select: none;
}

.table-responsive {
  max-height: 600px;
  overflow-y: auto;
}
</style>
