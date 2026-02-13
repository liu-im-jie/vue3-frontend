<script lang="ts" setup>
import { useRoute } from 'vue-router'
import Header from './components/header/index.vue'
import Sider from './components/sider/index.vue'
import TabsView from './components/tabs/index.vue'
import SmartService from '@/components/smartservice/index.vue'
import { useSettingStore } from '@/stores/setting'
import { useUserStore } from '@/stores/user'
import { useTabsStore } from '@/stores/tabs'

const route = useRoute()
const settingStore = useSettingStore()
const userStore = useUserStore()
const tabsStore = useTabsStore()

const componentKey = computed(() => `${String(route.name || route.path)}-${tabsStore.refreshKey}`)

// 判断是否有侧边栏
const hasSideMenu = computed(() => {
	const activeTop = settingStore.activeTopMenu
	if (!activeTop) return false
	const parentMenu = userStore.menus.find((m) => m.name === activeTop)
	return (parentMenu?.children || []).length > 0
})

const contentPaddingLeft = computed(() => {
	if (!userStore.token) return '0px'
	if (!hasSideMenu.value) return '0px'
	return settingStore.menuCollapsed ? '80px' : '220px'
})

const contentPaddingTop = computed(() => {
	return settingStore.showTabs ? '88px' : '48px'
})

const copyright = import.meta.env.VITE_COPYRIGHT || 'Copyright © 2026 Your Company'
</script>

<template>
	<div class="h-screen w-screen flex flex-col overflow-hidden bg-gray-50 transition-all dark:bg-black">
		<Header />
		<Sider />

		<!-- 标签页 -->
		<div v-if="settingStore.showTabs && userStore.token" class="fixed left-0 right-0 top-[48px] z-10">
			<TabsView />
		</div>

		<main
			class="relative flex flex-1 flex-col overflow-x-hidden overflow-y-auto transition-all duration-200 ease-in-out"
			:style="{
				marginLeft: contentPaddingLeft,
				paddingTop: contentPaddingTop,
				width: `calc(100% - ${contentPaddingLeft})`
			}"
		>
			<div class="relative flex-1 p-4">
				<div v-if="settingStore.contentLoading" class="absolute inset-0 z-10 bg-white p-4 dark:bg-gray-900">
					<a-skeleton active :paragraph="{ rows: 8 }" />
				</div>
				<router-view v-slot="{ Component }">
					<transition name="page-fade" mode="out-in">
						<keep-alive :include="tabsStore.cachedViews">
							<component :is="Component" :key="componentKey" />
						</keep-alive>
					</transition>
				</router-view>
			</div>

			<footer
				v-if="settingStore.showFooter"
				class="position-absolute bottom-0 w-full bg-gray-50/80 py-2 text-center text-xs text-gray-400 backdrop-blur-sm dark:bg-black/80"
			>
				{{ copyright }}
			</footer>
		</main>

		<!-- 智能客服 -->
		<SmartService />
	</div>
</template>

<style scoped>
/* 页面切换动画 - 从左侧淡入，从右侧淡出 */
.page-fade-enter-active {
	transition:
		opacity 0.35s ease-out,
		transform 0.35s ease-out;
}

.page-fade-leave-active {
	transition:
		opacity 0.3s ease-in,
		transform 0.3s ease-in;
}

.page-fade-enter-from {
	opacity: 0;
	transform: translateX(-20px);
}

.page-fade-leave-to {
	opacity: 0;
	transform: translateX(20px);
}
</style>
