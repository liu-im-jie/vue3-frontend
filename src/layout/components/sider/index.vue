<script setup lang="ts">
import { computed, ref, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import type { ItemType } from 'ant-design-vue'
import { Icon } from '@iconify/vue'
import { useSettingStore } from '@/stores/setting'
import { useUserStore } from '@/stores/user'

const settingStore = useSettingStore()
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

const currentSideMenus = computed(() => {
	const activeTop = settingStore.activeTopMenu
	if (!activeTop) return []
	const parentMenu = userStore.menus.find((m) => m.name === activeTop)
	return (parentMenu?.children || []) as RouteRecordRaw[]
})

const hasSideMenu = computed(() => currentSideMenus.value.length > 0)
const selectedKeys = computed(() => [route.name as string])
const openKeys = ref<string[]>([])

// 根据当前路由名称查找其所有父级菜单的 key，用于自动展开
const findParentKeys = (menus: RouteRecordRaw[], targetName: string, parents: string[] = []): string[] | null => {
	for (const menu of menus) {
		if (menu.name === targetName) {
			return parents
		}
		if (menu.children && menu.children.length > 0) {
			const result = findParentKeys(menu.children, targetName, [...parents, menu.name as string])
			if (result) return result
		}
	}
	return null
}

// 当路由变化时，自动展开对应的父级菜单
watch(
	() => route.name,
	(routeName) => {
		if (routeName && currentSideMenus.value.length > 0) {
			const parentKeys = findParentKeys(currentSideMenus.value, routeName as string)
			if (parentKeys && parentKeys.length > 0) {
				// 合并现有的 openKeys 和新的 parentKeys，避免收起其他已展开的菜单
				const newOpenKeys = [...new Set([...openKeys.value, ...parentKeys])]
				openKeys.value = newOpenKeys
			}
		}
	},
	{ immediate: true }
)

const handleClick = ({ key }: { key: string | number }) => {
	router.push({ name: String(key) })
}

function transformMenu(menus: RouteRecordRaw[]): ItemType[] {
	return menus.map((m) => {
		const key = m.name as string
		const label = (m.meta?.title as string) || (m.name as string)
		const iconStr = m.meta?.icon as string | undefined
		const icon = iconStr ? h(Icon, { icon: iconStr, class: 'text-lg' }) : undefined
		const hasChildren = m.children && m.children.length > 0

		if (hasChildren) {
			return { key, label, icon, children: transformMenu(m.children!) }
		}
		return { key, label, icon }
	})
}

const menuItems = computed(() => transformMenu(currentSideMenus.value))
</script>

<template>
	<transition name="sider-slide">
		<a-layout-sider
			v-if="hasSideMenu"
			v-model:collapsed="settingStore.menuCollapsed"
			width="220"
			:trigger="null"
			collapsible
			class="bottom-0 left-0 top-0 z-11 flex flex-col overflow-hidden pt-[48px] shadow-md !fixed !bg-white dark:!bg-[#001529]"
		>
			<div class="flex-1 overflow-y-auto">
				<a-menu
					v-model:selected-keys="selectedKeys"
					v-model:open-keys="openKeys"
					mode="inline"
					:items="menuItems"
					class="border-r-0"
					@click="handleClick"
				/>
			</div>

			<div
				class="h-12 w-full flex shrink-0 cursor-pointer items-center justify-center border-t border-gray-100 bg-white transition-colors dark:border-gray-700 dark:bg-[#001529] hover:bg-gray-50 dark:hover:bg-gray-800"
				@click="settingStore.toggleMenuCollapsed"
			>
				<Icon
					:icon="
						settingStore.menuCollapsed ? 'ant-design:menu-unfold-outlined' : 'ant-design:menu-fold-outlined'
					"
					class="text-lg"
				/>
			</div>
		</a-layout-sider>
	</transition>
</template>

<style scoped>
:deep(.ant-layout-sider-children) {
	display: flex;
	flex-direction: column;
	height: 100%;
	overflow: hidden;
}

.sider-slide-enter-active,
.sider-slide-leave-active {
	transition:
		transform 0.3s ease,
		opacity 0.3s ease;
}

.sider-slide-enter-from {
	transform: translateX(-100%);
	opacity: 0;
}

.sider-slide-leave-to {
	transform: translateX(-100%);
	opacity: 0;
}
</style>
