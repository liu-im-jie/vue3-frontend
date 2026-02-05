<script setup lang="ts">
import { useSettingStore } from '@/stores/setting'
import { PRESET_COLORS } from '@/constants/theme'
import SvgIcon from '@/components/base/svg-icon/index.vue'

const settingStore = useSettingStore()
const visible = ref(false)
const customColor = ref(settingStore.colorPrimary)

// 整体风格选项
const themeStyles = [
	{ key: 'light', label: '亮色模式', icon: 'light' },
	{ key: 'dark', label: '暗黑模式', icon: 'dark' }
]

// 设置主题风格
const setNavTheme = (theme: string) => {
	if (theme === 'dark') {
		if (!settingStore.isDark) settingStore.toggleDark()
	} else {
		if (settingStore.isDark) settingStore.toggleDark()
	}
}

// 设置主题色
const setThemeColor = (color: string) => {
	settingStore.setColorPrimary(color)
}

// 自定义颜色
const handleCustomColorChange = (e: Event) => {
	const target = e.target as HTMLInputElement
	customColor.value = target.value
	setThemeColor(target.value)
}

const showDrawer = () => {
	visible.value = true
}

// 暴露给父组件
defineExpose({
	showDrawer
})
</script>

<template>
	<a-drawer
		v-model:open="visible"
		title="系统设置"
		placement="right"
		:width="300"
		:class="{ 'dark-drawer': settingStore.isDark }"
		class="setting-drawer"
	>
		<!-- 整体风格 -->
		<div class="mb-6">
			<div class="mb-3 text-base font-medium">整体风格</div>
			<div class="flex gap-4">
				<a-tooltip v-for="theme in themeStyles" :key="theme.key" :title="theme.label">
					<div
						class="style-item"
						:class="{ active: (theme.key === 'dark') === settingStore.isDark }"
						@click="setNavTheme(theme.key)"
					>
						<SvgIcon :name="theme.icon" :size="50" />
					</div>
				</a-tooltip>
			</div>
		</div>

		<!-- 主题色 -->
		<div class="mb-6">
			<div class="mb-3 text-base font-medium">主题色</div>
			<div class="flex flex-wrap gap-2">
				<a-tooltip v-for="item in PRESET_COLORS" :key="item.key" :title="item.title">
					<div
						class="color-item"
						:class="{ active: settingStore.colorPrimary === item.value }"
						:style="{ backgroundColor: item.value }"
						@click="setThemeColor(item.value)"
					/>
				</a-tooltip>
				<!-- 自定义颜色 -->
				<a-tooltip title="自定义">
					<div
						class="color-item custom-color"
						:class="{
							active:
								!PRESET_COLORS.some((c) => c.value === settingStore.colorPrimary) &&
								settingStore.colorPrimary === customColor
						}"
						:style="{ backgroundColor: customColor }"
					>
						<input
							type="color"
							:value="customColor"
							class="color-picker"
							@input="handleCustomColorChange"
						/>
					</div>
				</a-tooltip>
			</div>
		</div>
	</a-drawer>
</template>

<style scoped>
.style-item {
	position: relative;
	padding: 4px;
	border-radius: 8px;
	cursor: pointer;
	transition: all 0.2s;
}

.style-item:hover {
	border-color: var(--ant-color-primary);
}

.style-item.active {
	border-color: var(--ant-color-primary);
}

.style-item.active::after {
	content: '✔';
	position: absolute;
	right: 12px;
	bottom: 10px;
	color: var(--ant-color-primary);
	font-size: 14px;
}

.color-item {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 28px;
	height: 28px;
	border-radius: 4px;
	cursor: pointer;
	transition: all 0.2s;
}

.color-item:hover {
	transform: scale(1.1);
}

.color-item.active::after {
	content: '✔';
	color: #fff;
	font-size: 12px;
}

.custom-color {
	position: relative;
	overflow: hidden;
}

.color-picker {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	padding: 0;
	border: 0;
	outline: none;
	opacity: 0;
	cursor: pointer;
}
</style>

<style>
/* 暗黑主题适配 - 需要全局样式来覆盖 ant-design-vue Drawer */
.dark .setting-drawer .ant-drawer-content {
	background-color: #141414;
}

.dark .setting-drawer .ant-drawer-header {
	background-color: #141414;
	border-bottom-color: #303030;
}

.dark .setting-drawer .ant-drawer-title {
	color: rgba(255, 255, 255, 0.85);
}

.dark .setting-drawer .ant-drawer-close {
	color: rgba(255, 255, 255, 0.45);
}

.dark .setting-drawer .ant-drawer-close:hover {
	color: rgba(255, 255, 255, 0.85);
}

.dark .setting-drawer .ant-drawer-body {
	color: rgba(255, 255, 255, 0.85);
}
</style>
