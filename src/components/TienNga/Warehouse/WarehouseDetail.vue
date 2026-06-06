<template>
  <div class="h-full p-6 overflow-y-auto flex flex-col warehouse-detail-wrapper">
    <!-- Header Navigation -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
      <div class="flex items-center gap-3">
        <el-button @click="emit('back')" circle class="shadow-sm hover:scale-105 transition-transform duration-200">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <div>
          <div class="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Chi Tiết Kho</div>
          <h2 class="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2 mt-0.5">
            {{ warehouse.name }}
          </h2>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <el-tag type="warning" size="large" effect="plain" class="font-bold">{{ warehouse.material }}</el-tag>
        <span class="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 font-medium">
          {{ warehouse.address }}
        </span>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div v-show="activeTab !== 'lookup'" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nguyên liệu</div>
        <div class="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{{ warehouse.material }}</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-blue-600 dark:text-blue-400">Số lượng hiện tại</div>
        <div class="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">{{ formatNumber(warehouse.currentQty) }} kg</div>
      </div>
      <div class="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <div class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Sức chứa</div>
        <div class="text-xl font-bold mt-1 text-gray-800 dark:text-gray-100">{{ warehouse.capacity }}</div>
      </div>
    </div>

    <!-- Main Tabs -->
    <div class="flex-1 min-height-0 flex flex-col">
      <el-tabs v-model="activeTab" type="border-card" class="detail-tabs h-full flex flex-col flex-1">

        <!-- 1. TAB THU MUA -->
        <el-tab-pane name="purchase" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><ShoppingCart /></el-icon>
              <span>Thu mua</span>
            </span>
          </template>

          <div class="flex-1 flex flex-col min-height-0">
            <!-- Filter Bar -->
            <div class="flex flex-wrap justify-between items-center mb-4 gap-4 shrink-0">
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="purchaseFilters.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="custom-dark-input highlight-select"
                    popper-class="custom-dark-select-popper"
                    style="width: 280px"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
                  <el-input
                    v-model="purchaseFilters.search"
                    placeholder="Tên khách hàng..."
                    :prefix-icon="Search"
                    clearable
                    class="w-60 custom-dark-input"
                  />
                </div>
              </div>
              <el-button type="primary" @click="openPurchaseDialog">Thêm giao dịch</el-button>
            </div>

            <!-- Table & Pagination -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table :data="paginatedPurchases" style="width: 100%" class="flex-1 custom-table" height="100%">
                <el-table-column label="Ngày giao dịch" width="130" fixed>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Tên khách hàng" prop="customerName" min-width="180" fixed show-overflow-tooltip />
                <el-table-column label="Nguyên liệu" prop="material" width="130">
                  <template #default="scope">
                    <el-tag type="warning" effect="light" round size="small">{{ scope.row.material }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Tên Kho" prop="warehouseName" width="180" show-overflow-tooltip />
                <el-table-column label="Số chuyến" prop="trips" width="110" align="right">
                  <template #default="scope">
                    <span class="font-medium">{{ scope.row.trips }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Khối lượng" width="130" align="right">
                  <template #default="scope">
                    <span>{{ formatNumber(scope.row.weight) }} kg</span>
                  </template>
                </el-table-column>
                <el-table-column label="Đơn giá" width="130" align="right">
                  <template #default="scope">
                    <span>{{ formatCurrency(scope.row.unitPrice) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Thành tiền" width="150" align="right">
                  <template #default="scope">
                    <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Ứng tiền" width="150" align="right">
                  <template #default="scope">
                    <span class="font-medium text-orange-500">{{ formatCurrency(scope.row.advanceAmount) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Công nợ" width="150" align="right">
                  <template #default="scope">
                    <span class="font-bold">{{ formatCurrency(scope.row.debt) }}</span>
                  </template>
                </el-table-column>
                <!-- Thao tác -->
                <el-table-column fixed="right" label="Thao tác" width="90" align="center">
                  <template #default="scope">
                    <el-dropdown trigger="click">
                      <el-button link type="info" class="p-1">
                        <el-icon class="text-xl"><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item>Chi tiết</el-dropdown-item>
                          <el-dropdown-item class="!text-red-500">Xóa</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>

              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="purchasePage"
                  v-model:page-size="purchasePageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredPurchases.length"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 2. TAB XUẤT KHO -->
        <el-tab-pane name="export" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><Van /></el-icon>
              <span>Xuất kho</span>
            </span>
          </template>

          <div class="flex-1 flex flex-col min-height-0">
            <!-- Filter Bar -->
            <div class="flex flex-wrap justify-between items-center mb-4 gap-4 shrink-0">
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="exportFilters.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="custom-dark-input highlight-select"
                    popper-class="custom-dark-select-popper"
                    style="width: 280px"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
                  <el-input
                    v-model="exportFilters.search"
                    placeholder="Người thực hiện..."
                    :prefix-icon="Search"
                    clearable
                    class="w-60 custom-dark-input"
                  />
                </div>
              </div>
              <el-button type="primary" @click="openExportDialog">Xuất kho</el-button>
            </div>

            <!-- Table & Pagination -->
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <el-table :data="paginatedExports" style="width: 100%" class="flex-1 custom-table" height="100%">
                <el-table-column label="Thời gian" width="130" fixed>
                  <template #default="scope">
                    <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="Người thực hiện" prop="executor" min-width="180" fixed show-overflow-tooltip />
                <el-table-column label="Loại nguyên liệu" prop="material" width="150">
                  <template #default="scope">
                    <el-tag type="warning" effect="light" round size="small">{{ scope.row.material }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="Tên Kho" prop="warehouseName" width="200" show-overflow-tooltip />
                <el-table-column label="Khối lượng xuất" width="160" align="right">
                  <template #default="scope">
                    <span class="font-bold text-rose-500 dark:text-rose-400">-{{ formatNumber(scope.row.exportWeight) }} kg</span>
                  </template>
                </el-table-column>
                <el-table-column label="Khối lượng còn lại" width="180" align="right">
                  <template #default="scope">
                    <span class="font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(scope.row.remainingWeight) }} kg</span>
                  </template>
                </el-table-column>
                <!-- Thao tác -->
                <el-table-column fixed="right" label="Thao tác" width="90" align="center">
                  <template #default="scope">
                    <el-dropdown trigger="click">
                      <el-button link type="info" class="p-1">
                        <el-icon class="text-xl"><MoreFilled /></el-icon>
                      </el-button>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item>Chi tiết</el-dropdown-item>
                          <el-dropdown-item class="!text-red-500">Xóa</el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </template>
                </el-table-column>
              </el-table>

              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="exportPage"
                  v-model:page-size="exportPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="filteredExports.length"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 3. TAB TRUY XUẤT THÔNG TIN -->
        <el-tab-pane name="lookup" class="h-full flex flex-col">
          <template #label>
            <span class="custom-tabs-label flex items-center gap-1">
              <el-icon><Search /></el-icon>
              <span>Truy xuất thông tin</span>
            </span>
          </template>

          <div class="lookup-container flex-1 flex flex-col min-height-0">
            <!-- Filter bar -->
            <div class="flex justify-between items-center mb-4 shrink-0">
              <div class="flex items-center gap-4 flex-wrap">
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Loại:</span>
                  <el-select
                    v-model="lookupFilters.category"
                    placeholder="Chọn loại"
                    style="width: 160px"
                    class="custom-dark-select highlight-select"
                    popper-class="custom-dark-select-popper"
                  >
                    <el-option label="Thu mua" value="purchase" />
                    <el-option label="Xuất kho" value="export" />
                  </el-select>
                </div>
                <div class="flex items-center gap-2">
                  <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Thời gian:</span>
                  <el-date-picker
                    v-model="lookupFilters.dateRange"
                    type="daterange"
                    range-separator="~"
                    start-placeholder="Từ ngày"
                    end-placeholder="Đến ngày"
                    format="DD/MM/YYYY"
                    value-format="YYYY-MM-DD"
                    class="custom-dark-input highlight-select"
                    popper-class="custom-dark-select-popper"
                    style="width: 280px"
                  />
                </div>
              </div>
              <el-button type="primary" :icon="Search" @click="handleLookupSearch">Tìm kiếm</el-button>
            </div>

            <!-- Stat Cards (after search) -->
            <div v-if="lookupSearched" class="summary-cards mb-4 shrink-0">
              <!-- Thu mua stats -->
              <div v-if="lookupFilters.category === 'purchase'" class="grid grid-cols-4 gap-4">
                <div class="stat-card stat-card--cyan">
                  <div class="stat-card__label">Tổng Khối lượng</div>
                  <div class="stat-card__value text-cyan-600 dark:text-cyan-400">{{ formatNumber(lookupPurchaseStats.totalWeight) }} kg</div>
                </div>
                <div class="stat-card stat-card--green">
                  <div class="stat-card__label">Tổng Thành tiền</div>
                  <div class="stat-card__value text-green-600 dark:text-green-400">{{ formatCurrency(lookupPurchaseStats.totalAmount) }} VNĐ</div>
                </div>
                <div class="stat-card stat-card--orange">
                  <div class="stat-card__label">Tổng Ứng tiền</div>
                  <div class="stat-card__value text-orange-600 dark:text-orange-400">{{ formatCurrency(lookupPurchaseStats.totalAdvance) }} VNĐ</div>
                </div>
                <div class="stat-card stat-card--blue">
                  <div class="stat-card__label">Tổng Công nợ</div>
                  <div class="stat-card__value text-blue-600 dark:text-blue-400">{{ formatCurrency(lookupPurchaseStats.totalDebt) }} VNĐ</div>
                </div>
              </div>
              <!-- Xuất kho stats -->
              <div v-if="lookupFilters.category === 'export'" class="grid grid-cols-1 gap-4" style="max-width: 300px">
                <div class="stat-card stat-card--rose">
                  <div class="stat-card__label">Tổng Khối lượng xuất</div>
                  <div class="stat-card__value text-rose-600 dark:text-rose-400">{{ formatNumber(lookupExportStats.totalExportWeight) }} kg</div>
                </div>
              </div>
            </div>

            <!-- Table (after search) -->
            <div v-if="lookupSearched" class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0 border border-gray-100 dark:border-gray-700">
              <!-- Purchase Lookup Table -->
              <template v-if="lookupFilters.category === 'purchase'">
                <el-table :data="paginatedLookupPurchases" style="width: 100%" class="flex-1 custom-table" height="100%">
                  <el-table-column label="Ngày giao dịch" width="130" fixed>
                    <template #default="scope">
                      <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Tên khách hàng" prop="customerName" min-width="180" show-overflow-tooltip />
                  <el-table-column label="Nguyên liệu" prop="material" width="130">
                    <template #default="scope">
                      <el-tag type="warning" effect="light" round size="small">{{ scope.row.material }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Tên Kho" prop="warehouseName" width="180" show-overflow-tooltip />
                  <el-table-column label="Số chuyến" prop="trips" width="110" align="right" />
                  <el-table-column label="Khối lượng" width="130" align="right">
                    <template #default="scope">{{ formatNumber(scope.row.weight) }} kg</template>
                  </el-table-column>
                  <el-table-column label="Đơn giá" width="130" align="right">
                    <template #default="scope">{{ formatCurrency(scope.row.unitPrice) }}</template>
                  </el-table-column>
                  <el-table-column label="Thành tiền" width="150" align="right">
                    <template #default="scope">
                      <span class="font-bold text-green-500">{{ formatCurrency(scope.row.totalAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Ứng tiền" width="150" align="right">
                    <template #default="scope">
                      <span class="font-medium text-orange-500">{{ formatCurrency(scope.row.advanceAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Công nợ" width="150" align="right">
                    <template #default="scope">
                      <span class="font-bold">{{ formatCurrency(scope.row.debt) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </template>

              <!-- Export Lookup Table -->
              <template v-if="lookupFilters.category === 'export'">
                <el-table :data="paginatedLookupExports" style="width: 100%" class="flex-1 custom-table" height="100%">
                  <el-table-column label="Thời gian" width="130" fixed>
                    <template #default="scope">
                      <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.date) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="Người thực hiện" prop="executor" min-width="180" show-overflow-tooltip />
                  <el-table-column label="Loại nguyên liệu" prop="material" width="150">
                    <template #default="scope">
                      <el-tag type="warning" effect="light" round size="small">{{ scope.row.material }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Tên Kho" prop="warehouseName" width="200" show-overflow-tooltip />
                  <el-table-column label="Khối lượng xuất" width="160" align="right">
                    <template #default="scope">
                      <span class="font-bold text-rose-500">-{{ formatNumber(scope.row.exportWeight) }} kg</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="KL còn lại" width="160" align="right">
                    <template #default="scope">
                      <span class="font-bold text-blue-600 dark:text-blue-400">{{ formatNumber(scope.row.remainingWeight) }} kg</span>
                    </template>
                  </el-table-column>
                </el-table>
              </template>

              <!-- Pagination -->
              <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                <el-pagination
                  v-model:current-page="lookupPage"
                  v-model:page-size="lookupPageSize"
                  :page-sizes="[10, 20, 50, 100]"
                  :background="true"
                  layout="total, sizes, prev, pager, next, jumper"
                  :total="lookupFilters.category === 'purchase' ? filteredLookupPurchases.length : filteredLookupExports.length"
                />
              </div>
            </div>

            <!-- Empty state before search -->
            <div v-if="!lookupSearched" class="flex-1 flex items-center justify-center">
              <div class="text-center text-gray-400 dark:text-gray-500">
                <el-icon class="text-6xl mb-4"><Search /></el-icon>
                <p class="text-lg">Vui lòng chọn loại và nhấn <strong>Tìm kiếm</strong> để truy xuất thông tin</p>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- ADD PURCHASE DIALOG -->
    <el-dialog v-model="purchaseDialogVisible" title="THÊM GIAO DỊCH THU MUA" width="700px" destroy-on-close class="custom-dark-dialog">
      <el-form :model="purchaseForm" :rules="purchaseRules" ref="purchaseFormRef" label-position="top" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Mã khách hàng" prop="customerCode">
              <el-input v-model="purchaseForm.customerCode" placeholder="Nhập mã khách hàng..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tên khách hàng" prop="customerName">
              <el-input v-model="purchaseForm.customerName" placeholder="Nhập tên khách hàng..." />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ngày giao dịch" prop="date">
              <el-date-picker v-model="purchaseForm.date" type="date" placeholder="Chọn ngày" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Nguyên liệu">
              <el-input :model-value="warehouse.material" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tên Kho">
              <el-input :model-value="warehouse.name" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Số chuyến" prop="trips">
              <el-input-number v-model="purchaseForm.trips" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="Khối lượng (kg)" prop="weight">
              <el-input-number v-model="purchaseForm.weight" :min="1" :step="100" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Đơn giá (VNĐ)" prop="unitPrice">
              <el-input-number v-model="purchaseForm.unitPrice" :min="100" :step="1000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="Thành tiền (VNĐ)">
              <el-input :model-value="formatCurrency(computedTotalAmount)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Ứng tiền (VNĐ)" prop="advanceAmount">
              <el-input-number v-model="purchaseForm.advanceAmount" :min="0" :step="100000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Công nợ (VNĐ)">
              <el-input :model-value="formatCurrency(computedDebt)" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2 pr-2">
          <el-button @click="purchaseDialogVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" @click="submitPurchase">Lưu giao dịch</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ADD EXPORT DIALOG -->
    <el-dialog v-model="exportDialogVisible" title="XUẤT KHO" width="500px" destroy-on-close class="custom-dark-dialog">
      <el-form :model="exportForm" :rules="exportRules" ref="exportFormRef" label-position="top" class="mt-4 px-2">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Người thực hiện" prop="executor">
              <el-input v-model="exportForm.executor" placeholder="Nhập tên người thực hiện..." />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Thời gian" prop="date">
              <el-date-picker v-model="exportForm.date" type="date" placeholder="Chọn ngày" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Khối lượng xuất (kg)" prop="exportWeight">
              <el-input-number v-model="exportForm.exportWeight" :min="1" :step="100" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="flex justify-end gap-2 pr-2">
          <el-button @click="exportDialogVisible = false">Hủy bỏ</el-button>
          <el-button type="primary" @click="submitExport">Xác nhận xuất kho</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Search,
  ShoppingCart,
  Van,
  MoreFilled
} from '@element-plus/icons-vue'

// Types
interface Warehouse {
  id: string
  name: string
  material: string
  address: string
  capacity: string
  currentQty: number
  icon: string
  color: string
}

interface PurchaseTransaction {
  id: string
  warehouseId: string
  date: string
  customerName: string
  material: string
  warehouseName: string
  trips: number
  weight: number
  unitPrice: number
  totalAmount: number
  advanceAmount: number
  debt: number
}

interface ExportTransaction {
  id: string
  warehouseId: string
  date: string
  executor: string
  material: string
  warehouseName: string
  exportWeight: number
  remainingWeight: number
}

const props = defineProps<{
  warehouse: Warehouse
  purchases: PurchaseTransaction[]
  exports: ExportTransaction[]
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'add-purchase', tx: Omit<PurchaseTransaction, 'id' | 'warehouseId'>): void
  (e: 'add-export', tx: Omit<ExportTransaction, 'id' | 'warehouseId'>): void
}>()

const activeTab = ref('purchase')

// ========== 1. THU MUA ==========
const purchaseFilters = reactive({
  dateRange: null as null | [string, string],
  search: ''
})
const purchasePage = ref(1)
const purchasePageSize = ref(10)

watch(() => purchaseFilters, () => { purchasePage.value = 1 }, { deep: true })

const filteredPurchases = computed(() => {
  return props.purchases.filter(t => {
    if (purchaseFilters.dateRange) {
      const [s, e] = purchaseFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    if (purchaseFilters.search) {
      const q = purchaseFilters.search.toLowerCase()
      if (!t.customerName.toLowerCase().includes(q)) return false
    }
    return true
  })
})

const paginatedPurchases = computed(() => {
  const s = (purchasePage.value - 1) * purchasePageSize.value
  return filteredPurchases.value.slice(s, s + purchasePageSize.value)
})

// Purchase Dialog
const purchaseDialogVisible = ref(false)
const purchaseFormRef = ref<FormInstance>()
const purchaseForm = reactive({
  customerCode: '',
  customerName: '',
  date: new Date().toISOString().substring(0, 10),
  trips: 1,
  weight: 1000,
  unitPrice: 10000,
  advanceAmount: 0
})
const purchaseRules = reactive<FormRules>({
  customerCode: [{ required: true, message: 'Vui lòng nhập mã khách hàng', trigger: 'blur' }],
  customerName: [{ required: true, message: 'Vui lòng nhập tên khách hàng', trigger: 'blur' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày', trigger: 'change' }],
  weight: [{ required: true, message: 'Vui lòng nhập khối lượng', trigger: 'blur' }],
  unitPrice: [{ required: true, message: 'Vui lòng nhập đơn giá', trigger: 'blur' }],
})

const computedTotalAmount = computed(() => purchaseForm.weight * purchaseForm.unitPrice)
const computedDebt = computed(() => computedTotalAmount.value - purchaseForm.advanceAmount)

const openPurchaseDialog = () => {
  purchaseForm.customerCode = ''
  purchaseForm.customerName = ''
  purchaseForm.date = new Date().toISOString().substring(0, 10)
  purchaseForm.trips = 1
  purchaseForm.weight = 1000
  purchaseForm.unitPrice = 10000
  purchaseForm.advanceAmount = 0
  purchaseDialogVisible.value = true
}

const submitPurchase = async () => {
  if (!purchaseFormRef.value) return
  await purchaseFormRef.value.validate((valid) => {
    if (valid) {
      emit('add-purchase', {
        date: purchaseForm.date,
        customerName: purchaseForm.customerName,
        material: props.warehouse.material,
        warehouseName: props.warehouse.name,
        trips: purchaseForm.trips,
        weight: purchaseForm.weight,
        unitPrice: purchaseForm.unitPrice,
        totalAmount: computedTotalAmount.value,
        advanceAmount: purchaseForm.advanceAmount,
        debt: computedDebt.value
      })
      purchaseDialogVisible.value = false
      ElMessage.success('Đã thêm giao dịch thu mua thành công!')
    }
  })
}

// ========== 2. XUẤT KHO ==========
const exportFilters = reactive({
  dateRange: null as null | [string, string],
  search: ''
})
const exportPage = ref(1)
const exportPageSize = ref(10)

watch(() => exportFilters, () => { exportPage.value = 1 }, { deep: true })

const filteredExports = computed(() => {
  return props.exports.filter(t => {
    if (exportFilters.dateRange) {
      const [s, e] = exportFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    if (exportFilters.search) {
      const q = exportFilters.search.toLowerCase()
      if (!t.executor.toLowerCase().includes(q)) return false
    }
    return true
  })
})

const paginatedExports = computed(() => {
  const s = (exportPage.value - 1) * exportPageSize.value
  return filteredExports.value.slice(s, s + exportPageSize.value)
})

// Export Dialog
const exportDialogVisible = ref(false)
const exportFormRef = ref<FormInstance>()
const exportForm = reactive({
  executor: '',
  date: new Date().toISOString().substring(0, 10),
  exportWeight: 100
})
const exportRules = reactive<FormRules>({
  executor: [{ required: true, message: 'Vui lòng nhập tên người thực hiện', trigger: 'blur' }],
  date: [{ required: true, message: 'Vui lòng chọn ngày', trigger: 'change' }],
  exportWeight: [{ required: true, message: 'Vui lòng nhập khối lượng xuất', trigger: 'blur' }],
})

const openExportDialog = () => {
  exportForm.executor = ''
  exportForm.date = new Date().toISOString().substring(0, 10)
  exportForm.exportWeight = 100
  exportDialogVisible.value = true
}

const submitExport = async () => {
  if (!exportFormRef.value) return
  await exportFormRef.value.validate((valid) => {
    if (valid) {
      emit('add-export', {
        date: exportForm.date,
        executor: exportForm.executor,
        material: props.warehouse.material,
        warehouseName: props.warehouse.name,
        exportWeight: exportForm.exportWeight,
        remainingWeight: props.warehouse.currentQty - exportForm.exportWeight
      })
      exportDialogVisible.value = false
      ElMessage.success('Đã xuất kho thành công!')
    }
  })
}

// ========== 3. TRUY XUẤT THÔNG TIN ==========
const lookupFilters = reactive({
  category: 'purchase' as 'purchase' | 'export',
  dateRange: null as null | [string, string]
})
const lookupSearched = ref(false)
const lookupPage = ref(1)
const lookupPageSize = ref(10)

const handleLookupSearch = () => {
  lookupSearched.value = true
  lookupPage.value = 1
}

const filteredLookupPurchases = computed(() => {
  return props.purchases.filter(t => {
    if (lookupFilters.dateRange) {
      const [s, e] = lookupFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    return true
  })
})

const filteredLookupExports = computed(() => {
  return props.exports.filter(t => {
    if (lookupFilters.dateRange) {
      const [s, e] = lookupFilters.dateRange
      if (t.date < s || t.date > e) return false
    }
    return true
  })
})

const paginatedLookupPurchases = computed(() => {
  const s = (lookupPage.value - 1) * lookupPageSize.value
  return filteredLookupPurchases.value.slice(s, s + lookupPageSize.value)
})

const paginatedLookupExports = computed(() => {
  const s = (lookupPage.value - 1) * lookupPageSize.value
  return filteredLookupExports.value.slice(s, s + lookupPageSize.value)
})

const lookupPurchaseStats = computed(() => ({
  totalWeight: filteredLookupPurchases.value.reduce((sum, t) => sum + t.weight, 0),
  totalAmount: filteredLookupPurchases.value.reduce((sum, t) => sum + t.totalAmount, 0),
  totalAdvance: filteredLookupPurchases.value.reduce((sum, t) => sum + t.advanceAmount, 0),
  totalDebt: filteredLookupPurchases.value.reduce((sum, t) => sum + t.debt, 0),
}))

const lookupExportStats = computed(() => ({
  totalExportWeight: filteredLookupExports.value.reduce((sum, t) => sum + t.exportWeight, 0),
}))

// ========== HELPERS ==========
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatDate = (dateString: string) => {
  const [year, month, day] = dateString.split('-')
  return `${day}/${month}/${year}`
}
</script>

<style scoped>
.detail-tabs {
  border-radius: 8px;
  overflow: hidden;
}
.detail-tabs :deep(.el-tabs__content) {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 450px;
}
.detail-tabs :deep(.el-tab-pane) {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 100%;
}

.custom-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

/* Summary stat cards */
.stat-card {
  padding: 16px 20px;
  border-radius: 10px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}
.stat-card__value {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.stat-card--cyan { border-left: 4px solid #06b6d4; }
.stat-card--green { border-left: 4px solid #22c55e; }
.stat-card--orange { border-left: 4px solid #f59e0b; }
.stat-card--blue { border-left: 4px solid #3b82f6; }
.stat-card--rose { border-left: 4px solid #f43f5e; }

/* Dark Mode */
html.dark .detail-tabs {
  background-color: #1f2937;
  border-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__header) {
  background-color: #111827;
  border-bottom-color: #374151;
}
html.dark .detail-tabs :deep(.el-tabs__item) {
  color: #9ca3af;
  border-color: transparent;
  transition: all 0.3s;
}
html.dark .detail-tabs :deep(.el-tabs__item:hover) {
  color: #d1d5db;
}
html.dark .detail-tabs :deep(.el-tabs__item.is-active) {
  background-color: #1f2937;
  border-right-color: #374151;
  border-left-color: #374151;
  border-bottom-color: #1f2937;
  color: #60a5fa;
}

html.dark .custom-dark-select :deep(.el-input__wrapper),
html.dark .custom-dark-input :deep(.el-input__wrapper) {
  background-color: #1f2937;
  box-shadow: 0 0 0 1px #374151 inset;
}
html.dark .custom-dark-select :deep(.el-input__inner),
html.dark .custom-dark-input :deep(.el-input__inner) {
  color: #f3f4f6;
}

html.dark .warehouse-detail-wrapper :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .warehouse-detail-wrapper :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .warehouse-detail-wrapper :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .warehouse-detail-wrapper :deep(.el-table .el-table-fixed-column--left),
html.dark .warehouse-detail-wrapper :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
}

html.dark .stat-card {
  background-color: #1f2937;
  border-color: #374151;
}
html.dark .stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
html.dark .stat-card__label {
  color: #9ca3af;
}

.highlight-select :deep(.el-select__wrapper) {
  background-color: transparent;
}
html.dark .highlight-select :deep(.el-select__wrapper) {
  background-color: #111827 !important;
  box-shadow: 0 0 0 1px #374151 inset !important;
  color: #f3f4f6;
}

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
