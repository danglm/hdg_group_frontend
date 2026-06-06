<template>
    <div class="bg-white/3 backdrop-blur-lg border border-white/40 p-10 rounded-[40px] shadow-2xl w-[400px] text-center">
        <div class="flex justify-center mb-2">
            <div class="bg-[#004274] p-3 rounded-full text-white">
                <el-icon :size="40"><User /></el-icon>
            </div>
        </div>

        <h2 class="text-4xl font-light text-[#004274] mb-8">Đăng ký</h2>

        <el-form @submit.prevent="handleRegister">
            <FormInput v-model="form.username" placeholder="Tên đăng nhập" />
            <FormInput v-model="form.email" placeholder="Email" />
            <FormInput v-model="form.password" type="password" placeholder="Mật khẩu" />
            <FormInput v-model="form.confirmPassword" type="password" placeholder="Xác nhận mật khẩu" />

            <div class="text-center mt-6 mb-8">
                <p class="text-sm text-gray-500">
                    Đã có tài khoản?
                    <span @click="$emit('switch', 'login')" class="text-[#004274] font-bold cursor-pointer hover:underline">
                        Đăng nhập
                    </span>
                </p>
            </div>

            <PrimaryButton @click="handleRegister">Đăng ký</PrimaryButton>
        </el-form>
    </div>
</template>

<script setup>
import { reactive } from 'vue'
import { User } from '@element-plus/icons-vue'
import FormInput from './FormInput.vue'
import PrimaryButton from './PrimaryButton.vue'

const emit = defineEmits(['switch'])

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = () => {
  console.log('Register with:', form)
}
</script>
