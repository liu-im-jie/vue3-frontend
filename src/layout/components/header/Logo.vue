<script setup lang="ts">
import { computed } from 'vue'
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()
const title = import.meta.env.VITE_APP_TITLE || 'Vue3 Admin'

const titleStyle = computed(() => ({
	color: settingStore.themeConfig.token?.colorPrimary || '#1677ff'
}))
</script>

<template>
	<div
		class="h-full flex items-center justify-start overflow-hidden bg-white pl-4 transition-all duration-300 dark:bg-[#001529]"
		:style="{
			width: settingStore.menuCollapsed ? '70px' : 'auto',
			minWidth: settingStore.menuCollapsed ? '70px' : '200px',
			paddingRight: settingStore.menuCollapsed ? '0' : '16px'
		}"
	>
		<img src="@/assets/logo/logo.png" alt="logo" class="h-8 w-8 flex-shrink-0 object-contain" />

		<h1
			v-show="!settingStore.menuCollapsed"
			class="m-0 ml-3 flex-shrink-0 whitespace-nowrap text-lg font-bold leading-[48px] transition-colors duration-300"
			:style="titleStyle"
		>
			{{ title }}
		</h1>
	</div>
</template>
