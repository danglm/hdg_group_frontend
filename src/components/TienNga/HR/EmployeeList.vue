<template>
  <div class="hr-container h-full flex flex-col">
    <!-- Filter Bar -->
    <div class="flex justify-between items-center mb-4 shrink-0">
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Giới tính:</span>
          <el-select
            v-model="filters.gender"
            placeholder="Tất cả"
            style="width: 140px"
            class="custom-dark-select highlight-select"
            popper-class="custom-dark-select-popper"
          >
            <el-option label="Tất cả" value="all" />
            <el-option label="Nam" value="Nam" />
            <el-option label="Nữ" value="Nữ" />
          </el-select>
        </div>
        <div class="flex items-center gap-2">
          <span class="whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">Tìm kiếm:</span>
          <el-input
            v-model="filters.search"
            placeholder="Mã NV, họ tên, SĐT..."
            :prefix-icon="Search"
            clearable
            class="w-64 custom-dark-input"
          />
        </div>
      </div>
      <el-button type="primary" @click="openAddDialog">Thêm nhân viên</el-button>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col flex-1 min-h-0">
      <el-table :data="paginatedData" style="width: 100%" class="flex-1" height="100%">
        <el-table-column type="selection" width="55" fixed />
        <el-table-column prop="code" label="Mã NV" width="100" fixed />
        <el-table-column prop="lastName" label="Họ" width="120" fixed />
        <el-table-column prop="firstName" label="Tên" width="100" fixed />
        <el-table-column prop="username" label="Username" width="130">
          <template #default="scope"><span class="text-blue-500">{{ scope.row.username }}</span></template>
        </el-table-column>
        <el-table-column prop="authorization" label="Ủy quyền" width="120" />
        <el-table-column prop="telegramGroup" label="Nhóm Telegram" width="200" show-overflow-tooltip />
        <el-table-column prop="gender" label="Giới tính" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.gender === 'Nam' ? 'primary' : 'danger'" effect="light" size="small" round>{{ scope.row.gender }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Ngày sinh" width="120">
          <template #default="scope"><span class="text-xs text-gray-600 dark:text-gray-400">{{ formatDate(scope.row.dob) }}</span></template>
        </el-table-column>
        <el-table-column prop="phone" label="SĐT" width="130" />
        <el-table-column prop="email" label="Email" width="200" show-overflow-tooltip />
        <el-table-column prop="address" label="Địa chỉ" width="280" show-overflow-tooltip />
        <el-table-column prop="idNumber" label="CCCD/CMND" width="140" />
        <el-table-column prop="idPlace" label="Nơi cấp" width="140" />
        <el-table-column prop="nationality" label="Quốc tịch" width="110" />
        <el-table-column prop="maritalStatus" label="Tình trạng hôn nhân" width="160" />
        <el-table-column prop="education" label="Trình độ học vấn" width="150" />
        <el-table-column prop="major" label="Chuyên ngành" width="140" />
        <el-table-column prop="certificate" label="Chứng chỉ" width="140" />
        <el-table-column prop="experience" label="Kinh nghiệm" width="120" />
        <el-table-column prop="department" label="Phòng ban" width="160" />
        <el-table-column prop="position" label="Chức vụ" width="160" />
        <el-table-column prop="contractType" label="Loại hợp đồng" width="140" />
        <el-table-column prop="photoUrl" label="Ảnh nhân viên" width="140" show-overflow-tooltip />
        <el-table-column label="Giờ vào ca" width="110" align="center">
          <template #default="scope">{{ scope.row.shiftStartStr || '07:00' }}</template>
        </el-table-column>
        <el-table-column label="Giờ tan ca" width="110" align="center">
          <template #default="scope">{{ scope.row.shiftEndStr || '16:00' }}</template>
        </el-table-column>
        <el-table-column label="Vào ca T7" width="110" align="center">
          <template #default="scope">{{ scope.row.satShiftStartStr || '07:00' }}</template>
        </el-table-column>
        <el-table-column label="Tan ca T7" width="110" align="center">
          <template #default="scope">{{ scope.row.satShiftEndStr || '11:30' }}</template>
        </el-table-column>
        <el-table-column label="Số giờ làm/ngày" width="140" align="center">
          <template #default="scope"><span class="font-medium">{{ scope.row.workHoursPerDay }}h</span></template>
        </el-table-column>
        <el-table-column label="Lương cơ bản" width="150" align="right">
          <template #default="scope"><span class="font-medium">{{ formatCurrency(scope.row.baseSalary) }}</span></template>
        </el-table-column>
        <el-table-column label="Lương tháng" width="150" align="right">
          <template #default="scope"><span class="font-bold text-green-500">{{ formatCurrency(scope.row.monthlySalary) }}</span></template>
        </el-table-column>
        <el-table-column label="Lương tuần" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.weeklySalary) }}</template>
        </el-table-column>
        <el-table-column label="Lương ngày" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.dailySalary) }}</template>
        </el-table-column>
        <el-table-column label="Lương giờ" width="130" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.hourlySalary) }}</template>
        </el-table-column>
        <el-table-column label="Lương làm thêm giờ" width="170" align="right">
          <template #default="scope"><span class="text-orange-500 font-medium">{{ formatCurrency(scope.row.overtimeSalary) }}</span></template>
        </el-table-column>
        <el-table-column label="Tiền thưởng" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.bonus) }}</template>
        </el-table-column>
        <el-table-column label="Tiền ăn trưa" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.lunchAllowance) }}</template>
        </el-table-column>
        <el-table-column label="Năng suất" width="130" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.productivity) }}</template>
        </el-table-column>
        <el-table-column label="Phụ cấp khác" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.otherAllowance) }}</template>
        </el-table-column>
        <el-table-column prop="benefit" label="Phúc lợi" width="140" show-overflow-tooltip />
        <el-table-column label="Số ngày phép năm" width="150" align="center">
          <template #default="scope"><span class="font-medium">{{ scope.row.annualLeaveDays }}</span></template>
        </el-table-column>
        <el-table-column prop="insurance" label="Bảo hiểm" width="160" show-overflow-tooltip />
        <el-table-column label="Bảo hiểm XH" width="140" align="right">
          <template #default="scope">{{ formatCurrency(scope.row.socialInsurance) }}</template>
        </el-table-column>
        <el-table-column prop="careerGoal" label="Mục tiêu nghề nghiệp" width="200" show-overflow-tooltip />
        <el-table-column prop="performanceReview" label="Đánh giá hiệu suất" width="160" />
        <el-table-column prop="bankName" label="Ngân hàng" width="150" />
        <el-table-column prop="bankAccount" label="Số tài khoản" width="160" />
        <el-table-column prop="paymentCode" label="Mã thanh toán" width="130" />
        <el-table-column prop="emergencyPhone" label="SĐT khẩn cấp" width="140" />
        <el-table-column prop="emergencyContact" label="Người liên hệ khẩn cấp" width="200" show-overflow-tooltip />
        <el-table-column label="Auto chấm công" width="140" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.autoAttendance ? 'success' : 'info'" effect="light" size="small" round>
              {{ scope.row.autoAttendance ? 'Có' : 'Không' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="workType" label="Loại công" width="100" align="center" />

        <!-- Thao tác -->
        <el-table-column fixed="right" label="Thao tác" width="90" align="center">
          <template #default>
            <el-dropdown trigger="click">
              <el-button link type="info" class="p-1">
                <el-icon class="text-xl"><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>Chi tiết</el-dropdown-item>
                  <el-dropdown-item>Chỉnh sửa</el-dropdown-item>
                  <el-dropdown-item divided class="!text-red-500">Xóa</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <!-- Phân trang -->
      <div class="mt-auto shrink-0 p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredData.length"
        />
      </div>
    </div>

    <!-- THÊM NHÂN VIÊN DIALOG -->
    <el-dialog v-model="dialogVisible" title="THÊM NHÂN VIÊN" width="900px" destroy-on-close class="custom-dark-dialog">
      <div class="max-h-[65vh] overflow-y-auto overflow-x-hidden px-2">
        <el-form :model="form" label-width="170px" class="mt-2 compact-form">
          <!-- THÔNG TIN CƠ BẢN -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              Thông tin cơ bản
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã NV">
                  <el-input v-model="form.code" placeholder="Mã NV..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Họ">
                  <el-input v-model="form.lastName" placeholder="Họ..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tên">
                  <el-input v-model="form.firstName" placeholder="Tên..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Username">
                  <el-input v-model="form.username" placeholder="Username..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Ủy quyền">
                  <el-input v-model="form.authorization" placeholder="Ủy quyền..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Nhóm Telegram">
                  <el-input v-model="form.telegramGroup" placeholder="Nhóm TG..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Giới tính">
                  <el-select v-model="form.gender" placeholder="Chọn" style="width: 100%" class="highlight-select">
                    <el-option label="Nam" value="Nam" />
                    <el-option label="Nữ" value="Nữ" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Ngày sinh">
                  <el-date-picker v-model="form.dob" type="date" placeholder="Chọn" format="DD/MM/YYYY" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="SĐT">
                  <el-input v-model="form.phone" placeholder="SĐT..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Email">
                  <el-input v-model="form.email" placeholder="Email..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Địa chỉ">
                  <el-input v-model="form.address" placeholder="Địa chỉ..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="CCCD/CMND">
                  <el-input v-model="form.idNumber" placeholder="Số CCCD..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Nơi cấp">
                  <el-input v-model="form.idPlace" placeholder="Nơi cấp..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Quốc tịch">
                  <el-input v-model="form.nationality" placeholder="Việt Nam" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tình trạng hôn nhân">
                  <el-select v-model="form.maritalStatus" placeholder="Chọn" style="width: 100%" class="highlight-select">
                    <el-option label="Độc thân" value="Độc thân" />
                    <el-option label="Đã kết hôn" value="Đã kết hôn" />
                    <el-option label="Ly hôn" value="Ly hôn" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Ảnh nhân viên">
                  <el-input v-model="form.photoUrl" placeholder="URL ảnh..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- HỌC VẤN & KINH NGHIỆM -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-emerald-500 rounded-full"></span>
              Học vấn & Kinh nghiệm
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Trình độ học vấn">
                  <el-select v-model="form.education" placeholder="Chọn" style="width: 100%" class="highlight-select">
                    <el-option label="Trung học" value="Trung học" />
                    <el-option label="Cao đẳng" value="Cao đẳng" />
                    <el-option label="Đại học" value="Đại học" />
                    <el-option label="Thạc sĩ" value="Thạc sĩ" />
                    <el-option label="Tiến sĩ" value="Tiến sĩ" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Chuyên ngành">
                  <el-input v-model="form.major" placeholder="Chuyên ngành..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Chứng chỉ">
                  <el-input v-model="form.certificate" placeholder="Chứng chỉ..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Kinh nghiệm">
                  <el-input v-model="form.experience" placeholder="Kinh nghiệm..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mục tiêu nghề nghiệp">
                  <el-input v-model="form.careerGoal" type="textarea" :rows="2" placeholder="Mục tiêu..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Đánh giá hiệu suất">
                  <el-input v-model="form.performanceReview" placeholder="Đánh giá..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- CÔNG VIỆC -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-violet-500 rounded-full"></span>
              Công việc
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Phòng ban">
                  <el-select v-model="form.department" placeholder="Chọn" style="width: 100%" class="highlight-select">
                    <el-option label="Ban Giám Đốc" value="Ban Giám Đốc" />
                    <el-option label="Phòng Kế Toán" value="Phòng Kế Toán" />
                    <el-option label="Phòng Nhân Sự" value="Phòng Nhân Sự" />
                    <el-option label="Phòng Kinh Doanh" value="Phòng Kinh Doanh" />
                    <el-option label="Phòng Kỹ Thuật" value="Phòng Kỹ Thuật" />
                    <el-option label="Xưởng Sản Xuất" value="Xưởng Sản Xuất" />
                    <el-option label="Đội Vận Tải" value="Đội Vận Tải" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Chức vụ">
                  <el-input v-model="form.position" placeholder="Chức vụ..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Loại hợp đồng">
                  <el-select v-model="form.contractType" placeholder="Chọn" style="width: 100%" class="highlight-select">
                    <el-option label="Chính thức" value="Chính thức" />
                    <el-option label="Thử việc" value="Thử việc" />
                    <el-option label="Thời vụ" value="Thời vụ" />
                    <el-option label="Cộng tác viên" value="Cộng tác viên" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- CA LÀM VIỆC -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-amber-500 rounded-full"></span>
              Ca làm việc
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Giờ vào ca">
                  <el-time-picker v-model="form.shiftStart" placeholder="hh:mm" format="HH:mm" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Giờ tan ca">
                  <el-time-picker v-model="form.shiftEnd" placeholder="hh:mm" format="HH:mm" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Vào ca T7">
                  <el-time-picker v-model="form.satShiftStart" placeholder="hh:mm" format="HH:mm" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tan ca T7">
                  <el-time-picker v-model="form.satShiftEnd" placeholder="hh:mm" format="HH:mm" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Số giờ/ngày">
                  <el-input-number v-model="form.workHoursPerDay" :min="1" :max="24" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Auto chấm công">
                  <el-select v-model="form.autoAttendance" style="width: 100%" class="highlight-select">
                    <el-option label="Có" :value="true" />
                    <el-option label="Không" :value="false" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Loại công">
                  <el-select v-model="form.workType" style="width: 100%" class="highlight-select">
                    <el-option label="1" :value="1" />
                    <el-option label="2" :value="2" />
                    <el-option label="3" :value="3" />
                    <el-option label="4" :value="4" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- LƯƠNG & PHỤ CẤP -->
          <div class="mb-4">
            <h4 class="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-rose-500 rounded-full"></span>
              Lương & Phụ cấp
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Lương cơ bản (VNĐ)">
                  <el-input-number v-model="form.baseSalary" :min="0" :step="500000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Lương tháng (VNĐ)">
                  <el-input-number v-model="form.monthlySalary" :min="0" :step="500000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Lương tuần (VNĐ)">
                  <el-input-number v-model="form.weeklySalary" :min="0" :step="100000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Lương ngày (VNĐ)">
                  <el-input-number v-model="form.dailySalary" :min="0" :step="50000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Lương giờ (VNĐ)">
                  <el-input-number v-model="form.hourlySalary" :min="0" :step="10000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Lương OT (VNĐ)">
                  <el-input-number v-model="form.overtimeSalary" :min="0" :step="10000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Tiền thưởng (VNĐ)">
                  <el-input-number v-model="form.bonus" :min="0" :step="100000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Tiền ăn trưa (VNĐ)">
                  <el-input-number v-model="form.lunchAllowance" :min="0" :step="10000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Năng suất (VNĐ)">
                  <el-input-number v-model="form.productivity" :min="0" :step="50000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Phụ cấp khác (VNĐ)">
                  <el-input-number v-model="form.otherAllowance" :min="0" :step="50000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Phúc lợi">
                  <el-input v-model="form.benefit" placeholder="Phúc lợi..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số ngày phép năm">
                  <el-input-number v-model="form.annualLeaveDays" :min="0" :max="30" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Bảo hiểm">
                  <el-input v-model="form.insurance" placeholder="Loại bảo hiểm..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Bảo hiểm XH (VNĐ)">
                  <el-input-number v-model="form.socialInsurance" :min="0" :step="100000" controls-position="right" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- NGÂN HÀNG & LIÊN HỆ -->
          <div class="mb-2">
            <h4 class="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span class="w-1.5 h-4 bg-cyan-500 rounded-full"></span>
              Ngân hàng & Liên hệ khẩn cấp
            </h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Ngân hàng">
                  <el-input v-model="form.bankName" placeholder="Ngân hàng..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Số tài khoản">
                  <el-input v-model="form.bankAccount" placeholder="STK..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Mã thanh toán">
                  <el-input v-model="form.paymentCode" placeholder="Mã TT..." />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="SĐT khẩn cấp">
                  <el-input v-model="form.emergencyPhone" placeholder="SĐT khẩn cấp..." />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Người liên hệ khẩn cấp">
                  <el-input v-model="form.emergencyContact" placeholder="Tên người liên hệ..." />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Hủy</el-button>
          <el-button type="primary" @click="submitForm">Xác nhận</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { MoreFilled, Search } from '@element-plus/icons-vue'
import { ElNotification } from 'element-plus'

// Filters
const filters = reactive({ gender: 'all', search: '' })
const currentPage = ref(1)
const pageSize = ref(10)

watch(() => filters, () => { currentPage.value = 1 }, { deep: true })

// Dialog
const dialogVisible = ref(false)

const defaultForm = () => ({
  code: '', lastName: '', firstName: '', username: '', authorization: '', telegramGroup: '',
  gender: 'Nam', dob: '', phone: '', email: '', address: '', idNumber: '', idPlace: '',
  nationality: 'Việt Nam', maritalStatus: 'Độc thân', education: 'Đại học', major: '',
  certificate: '', experience: '', department: '', position: '', contractType: 'Chính thức',
  photoUrl: '',
  shiftStart: null as any, shiftEnd: null as any, satShiftStart: null as any, satShiftEnd: null as any,
  workHoursPerDay: 8,
  baseSalary: 5000000, monthlySalary: 8000000, weeklySalary: 2000000, dailySalary: 300000,
  hourlySalary: 40000, overtimeSalary: 60000, bonus: 0, lunchAllowance: 30000,
  productivity: 0, otherAllowance: 0, benefit: '', annualLeaveDays: 12,
  insurance: '', socialInsurance: 0,
  bankName: '', bankAccount: '', paymentCode: '',
  emergencyPhone: '', emergencyContact: '',
  autoAttendance: true, workType: 3,
  careerGoal: '', performanceReview: ''
})

const form = reactive(defaultForm())

const openAddDialog = () => {
  Object.assign(form, defaultForm())
  dialogVisible.value = true
}

const submitForm = () => {
  dialogVisible.value = false
  ElNotification({ title: 'Thành công', message: 'Đã thêm nhân viên mới thành công!', type: 'success' })
}

// Helpers
const formatCurrency = (v: number) => new Intl.NumberFormat('vi-VN').format(v)
const formatDate = (d: string) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}` }

// Mock Data
const generateMockData = () => {
  const data: any[] = []
  const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng']
  const firstNames = ['An', 'Bình', 'Cường', 'Dũng', 'Hương', 'Phong', 'Giang', 'Hải', 'Linh', 'Khánh', 'Mai', 'Thảo']
  const departments = ['Ban Giám Đốc', 'Phòng Kế Toán', 'Phòng Nhân Sự', 'Phòng Kinh Doanh', 'Phòng Kỹ Thuật', 'Xưởng Sản Xuất', 'Đội Vận Tải']
  const positions = ['Giám đốc', 'Kế toán trưởng', 'Trưởng phòng', 'Nhân viên', 'Công nhân', 'Tài xế', 'Quản lý xưởng', 'Thủ kho']
  const contracts = ['Chính thức', 'Thử việc', 'Thời vụ', 'Cộng tác viên']
  const banks = ['Techcombank', 'Vietcombank', 'VietinBank', 'MB Bank', 'ACB', 'BIDV', 'Agribank']
  const genders = ['Nam', 'Nam', 'Nam', 'Nữ'] // 75% male

  for (let i = 1; i <= 20; i++) {
    const ln = lastNames[i % lastNames.length] || 'Nguyễn'
    const fn = firstNames[i % firstNames.length] || 'An'
    const gender = genders[i % genders.length] || 'Nam'
    const base = (Math.floor(Math.random() * 10) + 4) * 1000000
    data.push({
      id: i,
      code: `NV${String(i).padStart(3, '0')}`,
      lastName: ln,
      firstName: fn,
      username: `@${fn.toLowerCase()}${i}`,
      authorization: i <= 3 ? 'Quản lý' : 'Nhân viên',
      telegramGroup: `Nhóm ${departments[i % departments.length]}`,
      gender,
      dob: `${1985 + (i % 15)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
      phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      email: `${fn.toLowerCase()}${i}@tiennga.vn`,
      address: `Số ${i * 3}, Đường ${i % 5 + 1}, Đức Linh, Bình Thuận`,
      idNumber: `0${Math.floor(Math.random() * 900000000 + 100000000)}${i % 10}${i % 3}`,
      idPlace: 'CA Bình Thuận',
      nationality: 'Việt Nam',
      maritalStatus: i % 3 === 0 ? 'Đã kết hôn' : 'Độc thân',
      education: ['Trung học', 'Cao đẳng', 'Đại học', 'Thạc sĩ'][i % 4],
      major: ['Quản trị', 'Kế toán', 'Cơ khí', 'CNTT', 'Nông nghiệp'][i % 5],
      certificate: i % 3 === 0 ? 'TOEIC 650' : '',
      experience: `${(i % 10) + 1} năm`,
      department: departments[i % departments.length],
      position: positions[i % positions.length],
      contractType: contracts[i % contracts.length],
      photoUrl: '',
      shiftStartStr: '07:00',
      shiftEndStr: '16:00',
      satShiftStartStr: '07:00',
      satShiftEndStr: '11:30',
      workHoursPerDay: 8,
      baseSalary: base,
      monthlySalary: base + 3000000,
      weeklySalary: Math.round((base + 3000000) / 4),
      dailySalary: Math.round((base + 3000000) / 26),
      hourlySalary: Math.round((base + 3000000) / 26 / 8),
      overtimeSalary: Math.round((base + 3000000) / 26 / 8 * 1.5),
      bonus: i % 4 === 0 ? 1000000 : 0,
      lunchAllowance: 30000,
      productivity: i % 5 === 0 ? 500000 : 0,
      otherAllowance: 0,
      benefit: 'BHXH, BHYT',
      annualLeaveDays: 12,
      insurance: 'BHXH, BHYT, BHTN',
      socialInsurance: Math.round(base * 0.105),
      bankName: banks[i % banks.length],
      bankAccount: `1903${Math.floor(Math.random() * 900000000 + 100000000)}`,
      paymentCode: `TT-${String(i).padStart(3, '0')}`,
      emergencyPhone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
      emergencyContact: `${lastNames[(i + 3) % lastNames.length]} Văn ${firstNames[(i + 5) % firstNames.length]}`,
      autoAttendance: i % 6 !== 0,
      workType: i % 5 === 0 ? 4 : 3,
      careerGoal: '',
      performanceReview: ['Tốt', 'Khá', 'Trung bình', 'Xuất sắc'][i % 4]
    })
  }
  return data
}

const allData = ref(generateMockData())

const filteredData = computed(() => {
  return allData.value.filter(e => {
    if (filters.gender !== 'all' && e.gender !== filters.gender) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const fullName = `${e.lastName} ${e.firstName}`.toLowerCase()
      if (!fullName.includes(q) && !e.code.toLowerCase().includes(q) && !e.phone.includes(q)) return false
    }
    return true
  })
})

const paginatedData = computed(() => {
  const s = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(s, s + pageSize.value)
})
</script>

<style scoped>
.hr-container :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
}

html.dark .hr-container :deep(.el-table) {
  background-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #111827;
  --el-table-row-hover-bg-color: #374151;
  --el-table-border-color: #374151;
  --el-table-border: 1px solid #374151;
}
html.dark .hr-container :deep(.el-table th.el-table__cell) {
  background-color: #111827 !important;
}
html.dark .hr-container :deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #374151;
}
html.dark .hr-container :deep(.el-table .el-table-fixed-column--left),
html.dark .hr-container :deep(.el-table .el-table-fixed-column--right) {
  background-color: #1f2937 !important;
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

:deep(.el-input-number .el-input__inner) {
  text-align: left;
}
</style>
