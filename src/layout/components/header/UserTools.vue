<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useSettingStore } from '@/stores/setting'
import { Icon } from '@iconify/vue'
import SettingDrawer from './SettingDrawer.vue'

const userStore = useUserStore()
const settingStore = useSettingStore()
const settingDrawerRef = ref<InstanceType<typeof SettingDrawer>>()

const handleLogout = () => {
	userStore.logout()
}

const openSetting = () => {
	settingDrawerRef.value?.showDrawer()
}
</script>

<template>
	<div class="flex items-center gap-4 px-4">
		<a-dropdown>
			<div class="flex cursor-pointer items-center gap-2">
				<a-avatar size="small" class="avatar-glow" :style="{ '--glow-color': settingStore.colorPrimary }">
					{{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}
				</a-avatar>
				<span class="text-sm" :style="{ color: settingStore.colorPrimary }">
					{{ userStore.userInfo?.nickname || '用户' }}
				</span>
			</div>
			<template #overlay>
				<a-menu>
					<a-menu-item key="profile">
						<span>个人中心</span>
					</a-menu-item>
					<a-menu-divider />
					<a-menu-item key="logout" @click="handleLogout">
						<span>退出登录</span>
					</a-menu-item>
				</a-menu>
			</template>
		</a-dropdown>

		<!-- 设置图标 -->
		<div
			class="flex cursor-pointer items-center justify-center text-gray-500 transition-colors hover:text-[var(--ant-color-primary)]"
			@click="openSetting"
		>
			<Icon icon="ant-design:setting-outlined" class="text-lg" />
		</div>

		<!-- 设置抽屉 -->
		<SettingDrawer ref="settingDrawerRef" />
	</div>
</template>

<style scoped>
.avatar-glow {
	box-shadow: 0 0 8px 2px color-mix(in srgb, var(--glow-color) 50%, transparent);
	transition: box-shadow 0.3s ease;
}

.avatar-glow:hover {
	box-shadow: 0 0 12px 4px color-mix(in srgb, var(--glow-color) 70%, transparent);
}
</style>
