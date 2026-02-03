<script lang="ts" setup>
import { useUserStore } from '@/stores/user'
import to from '@/utils/awaitTo'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const loginFormModel = ref({
	username: '',
	password: ''
})

const copyright = import.meta.env.VITE_COPYRIGHT || 'Copyright © 2026 Your Company'
const appTitle = import.meta.env.VITE_APP_TITLE

const handleSubmit = async () => {
	const { username, password } = loginFormModel.value
	if (username.trim() === '' || password.trim() === '') {
		return message.warning('用户名或密码不能为空！')
	}
	message.loading('登录中...', 0)
	loading.value = true

	const [err] = await to(userStore.login(loginFormModel.value))

	if (err) {
		Modal.error({
			title: () => '提示',
			content: () => err.message
		})
	} else {
		message.success('登录成功！')
		// 跳转到根路径，路由守卫会处理 afterLogin 并加载动态路由后跳转到首页
		router.replace('/')
	}
	loading.value = false
	message.destroy()
}
</script>

<template>
	<div
		class="login-container relative w-full flex flex-col items-center bg-[size:100%] bg-[url('@/assets/login.svg')] pt-200px dark:bg-[#141414]"
	>
		<div class="mb-30px flex items-center">
			<img alt="logo" src="~@/assets/logo/logo.png" width="45" />
			<h1 class="text-primary ml-2 text-3xl font-bold">{{ appTitle }}</h1>
		</div>

		<a-form :model="loginFormModel" class="w-400px" layout="horizontal" @submit.prevent="handleSubmit">
			<a-form-item>
				<a-input v-model:value="loginFormModel.username" placeholder="用户名" size="large">
					<template #prefix>
						<UserOutlined />
					</template>
				</a-input>
			</a-form-item>

			<a-form-item>
				<a-input
					v-model:value="loginFormModel.password"
					autocomplete="new-password"
					placeholder="密码"
					size="large"
					type="password"
				>
					<template #prefix>
						<LockOutlined />
					</template>
				</a-input>
			</a-form-item>

			<a-form-item>
				<a-button :loading="loading" block html-type="submit" size="large" type="primary">登录</a-button>
			</a-form-item>
		</a-form>

		<div class="absolute bottom-24px left-0 w-full text-center text-sm text-black/45 dark:text-white/45">
			{{ copyright }}
		</div>
	</div>
</template>

<style scoped>
.login-container {
	min-height: 100vh;
	transition: background-color 0.3s ease;
}

/* 暗黑模式下隐藏背景图片，使用纯色背景 */
:global(.dark) .login-container {
	background-image: none !important;
}
</style>
