<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSettingStore } from '@/stores/setting'
import { useUserStore } from '@/stores/user'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()
const settingStore = useSettingStore()
const userStore = useUserStore()

const primaryColor = computed(() => settingStore.themeConfig.token?.colorPrimary || '#1677ff')

const menuStyle = computed(() => ({
	'--top-menu-primary-color': primaryColor.value
}))

const topMenus = computed(() => {
	return userStore.menus.map((menu) => ({
		key: menu.name as string,
		label: menu.meta?.title || menu.name,
		icon: menu.meta?.icon ? h(Icon, { icon: menu.meta.icon as string, class: 'text-lg' }) : undefined
	}))
})

const findTopMenuByRouteName = (routeName: string): string | undefined => {
	const findInChildren = (children: any[]): boolean => {
		for (const child of children) {
			if (child.name === routeName) return true
			if (child.children && child.children.length > 0) {
				if (findInChildren(child.children)) return true
			}
		}
		return false
	}

	for (const topMenu of userStore.menus) {
		// 如果顶级菜单本身就是这个路由
		if (topMenu.name === routeName) return topMenu.name as string
		// 在子菜单中查找
		if (topMenu.children && findInChildren(topMenu.children)) {
			return topMenu.name as string
		}
	}
	return undefined
}

watch(
	() => route.name,
	(routeName) => {
		if (routeName && userStore.menus.length > 0) {
			const topMenuKey = findTopMenuByRouteName(routeName as string)
			if (topMenuKey) {
				settingStore.setActiveTopMenu(topMenuKey)
			}
		}
	},
	{ immediate: true }
)

// 递归查找第一个有效的叶子节点路由名称
const findFirstLeafRouteName = (menu: any): string | undefined => {
	if (menu.children && menu.children.length > 0) {
		return findFirstLeafRouteName(menu.children[0])
	}
	return menu.name as string
}

const handleMenuClick = (menuKey: string) => {
	const menu = userStore.menus.find((item) => item.name === menuKey)
	if (!menu) {
		return
	}

	settingStore.setActiveTopMenu(menuKey)

	// 找到第一个叶子节点
	const targetRouteName = findFirstLeafRouteName(menu)
	if (targetRouteName) {
		router.push({ name: targetRouteName })
	}
}
</script>

<template>
	<div class="top-menu-container min-w-0 flex-1 overflow-hidden" :style="menuStyle">
		<a-menu
			:selected-keys="[settingStore.activeTopMenu]"
			mode="horizontal"
			:items="topMenus"
			class="border-none bg-transparent !leading-[48px]"
			@click="({ key }: any) => handleMenuClick(key)"
		/>
	</div>
</template>

<style>
.top-menu-container {
	.ant-menu.ant-menu-root.ant-menu-horizontal {
		border-bottom: none !important;
		background: transparent !important;
		line-height: 48px;
	}

	.ant-menu.ant-menu-horizontal.ant-menu-light {
		border-bottom: none !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item {
		position: relative !important;
		padding: 0 20px !important;
		margin: 0 4px !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item:hover:not(.ant-menu-item-selected) {
		color: var(--top-menu-primary-color) !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item-selected {
		color: var(--top-menu-primary-color) !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item::after {
		position: absolute !important;
		inset-inline: unset !important;
		bottom: 0 !important;
		border-bottom: 3px solid transparent !important;
		content: '' !important;
		display: block !important;
		width: 0 !important;
		left: 50% !important;
		right: auto !important;
		transform: translateX(-45%) !important;
		transition:
			width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1),
			border-color 0.3s !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item:hover::after {
		width: calc(100% - 10px) !important;
		border-bottom-color: var(--top-menu-primary-color) !important;
	}

	.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item-selected::after {
		width: calc(100% - 10px) !important;
		border-bottom-color: var(--top-menu-primary-color) !important;
	}

	/* 深色模式 */
	.ant-menu-dark.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item {
		border-radius: 4px;
	}

	.ant-menu-dark.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item:hover {
		color: #fff !important;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.ant-menu-dark.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item:hover::after {
		width: 0 !important;
		border-bottom-color: transparent !important;
	}

	.ant-menu-dark.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item-selected {
		background-color: var(--top-menu-primary-color) !important;
		color: #fff !important;
	}

	.ant-menu-dark.ant-menu-horizontal .ant-menu-overflow-item.ant-menu-item-selected::after {
		width: 0 !important;
		border-bottom-color: transparent !important;
	}
}
</style>
