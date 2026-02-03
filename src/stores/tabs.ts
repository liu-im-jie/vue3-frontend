import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'

export interface TabItem {
	name: string
	path: string
	title: string
	icon?: string
	affix?: boolean
}

export const useTabsStore = defineStore(
	'tabs',
	() => {
		// 标签页列表
		const tabs = ref<TabItem[]>([])
		// 当前激活的标签
		const activeTab = ref<string>('')
		// 缓存的页面名称列表
		const cachedViews = ref<string[]>([])
		// 需要刷新的页面
		const refreshKey = ref<number>(0)

		// 添加标签
		const addTab = (route: RouteLocationNormalized) => {
			const { name, path, meta } = route
			if (!name || meta?.hideInTabs) return

			const tabName = name as string
			const exists = tabs.value.some((tab) => tab.name === tabName)

			if (!exists) {
				tabs.value.push({
					name: tabName,
					path,
					title: (meta?.title as string) || tabName,
					icon: meta?.icon as string,
					affix: meta?.affix as boolean
				})
			}

			activeTab.value = tabName

			// 添加到缓存
			if (!cachedViews.value.includes(tabName)) {
				cachedViews.value.push(tabName)
			}
		}

		// 关闭标签
		const closeTab = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index === -1) return null

			const tab = tabs.value[index]
			if (tab && tab.affix) return null // 固定标签不能关闭

			tabs.value.splice(index, 1)

			// 从缓存中移除
			const cacheIndex = cachedViews.value.indexOf(tabName)
			if (cacheIndex > -1) {
				cachedViews.value.splice(cacheIndex, 1)
			}

			// 如果关闭的是当前标签，切换到相邻标签
			if (activeTab.value === tabName && tabs.value.length > 0) {
				const nextTab = tabs.value[Math.min(index, tabs.value.length - 1)]
				return nextTab?.path || null
			}
			return null
		}

		// 关闭其他标签
		const closeOtherTabs = (tabName: string) => {
			tabs.value = tabs.value.filter((tab) => tab.name === tabName || tab.affix)
			cachedViews.value = tabs.value.map((tab) => tab.name)
			activeTab.value = tabName
		}

		// 关闭左侧标签
		const closeLeftTabs = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index > 0) {
				const closedTabs = tabs.value.slice(0, index).filter((tab) => !tab.affix)
				tabs.value = tabs.value.filter((tab, i) => i >= index || tab.affix)
				closedTabs.forEach((tab) => {
					const cacheIndex = cachedViews.value.indexOf(tab.name)
					if (cacheIndex > -1) cachedViews.value.splice(cacheIndex, 1)
				})
			}
		}

		// 关闭右侧标签
		const closeRightTabs = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index < tabs.value.length - 1) {
				const closedTabs = tabs.value.slice(index + 1).filter((tab) => !tab.affix)
				tabs.value = tabs.value.filter((tab, i) => i <= index || tab.affix)
				closedTabs.forEach((tab) => {
					const cacheIndex = cachedViews.value.indexOf(tab.name)
					if (cacheIndex > -1) cachedViews.value.splice(cacheIndex, 1)
				})
			}
		}

		// 关闭所有标签
		const closeAllTabs = () => {
			tabs.value = tabs.value.filter((tab) => tab.affix)
			cachedViews.value = tabs.value.map((tab) => tab.name)
			return tabs.value[0]?.path || '/dashboard'
		}

		// 刷新当前页面
		const refreshCurrentTab = (tabName: string) => {
			const cacheIndex = cachedViews.value.indexOf(tabName)
			if (cacheIndex > -1) {
				cachedViews.value.splice(cacheIndex, 1)
				// 下一帧重新添加到缓存
				nextTick(() => {
					cachedViews.value.push(tabName)
					refreshKey.value++
				})
			}
		}

		// 设置当前标签
		const setActiveTab = (tabName: string) => {
			activeTab.value = tabName
		}

		// 重置标签
		const resetTabs = () => {
			tabs.value = []
			cachedViews.value = []
			activeTab.value = ''
		}

		return {
			tabs,
			activeTab,
			cachedViews,
			refreshKey,
			addTab,
			closeTab,
			closeOtherTabs,
			closeLeftTabs,
			closeRightTabs,
			closeAllTabs,
			refreshCurrentTab,
			setActiveTab,
			resetTabs
		}
	},
	{
		persist: {
			pick: ['tabs', 'activeTab', 'cachedViews']
		}
	}
)
