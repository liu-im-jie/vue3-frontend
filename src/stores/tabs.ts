import { defineStore } from 'pinia'
import type { RouteLocationNormalized } from 'vue-router'
import { REDIRECT_NAME } from '@/constants/router'

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
		const tabs = ref<TabItem[]>([])
		const activeTab = ref<string>('')
		const _cachedViews = ref<string[]>([])
		const refreshKey = ref(0)

		// 始终包含 ParentRouteContainer，确保父容器不被销毁
		const cachedViews = computed(() => {
			const views = [..._cachedViews.value]
			if (!views.includes('ParentRouteContainer')) {
				views.push('ParentRouteContainer')
			}
			return views
		})

		const addTab = (route: RouteLocationNormalized) => {
			const { name, path, meta } = route
			if (!name || name === REDIRECT_NAME || meta?.hideInTabs) return

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

			if (!_cachedViews.value.includes(tabName)) {
				_cachedViews.value.push(tabName)
			}
		}

		const closeTab = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index === -1) return null

			const tab = tabs.value[index]
			if (tab && tab.affix) return null

			tabs.value.splice(index, 1)

			const cacheIndex = _cachedViews.value.indexOf(tabName)
			if (cacheIndex > -1) {
				_cachedViews.value.splice(cacheIndex, 1)
			}

			if (activeTab.value === tabName && tabs.value.length > 0) {
				const nextTab = tabs.value[Math.min(index, tabs.value.length - 1)]
				return nextTab?.path || null
			}
			return null
		}

		const closeOtherTabs = (tabName: string) => {
			tabs.value = tabs.value.filter((tab) => tab.name === tabName || tab.affix)
			_cachedViews.value = tabs.value.map((tab) => tab.name)
			activeTab.value = tabName
		}

		const closeLeftTabs = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index > 0) {
				const closedTabs = tabs.value.slice(0, index).filter((tab) => !tab.affix)
				tabs.value = tabs.value.filter((tab, i) => i >= index || tab.affix)
				closedTabs.forEach((tab) => {
					const cacheIndex = _cachedViews.value.indexOf(tab.name)
					if (cacheIndex > -1) _cachedViews.value.splice(cacheIndex, 1)
				})
			}
		}

		const closeRightTabs = (tabName: string) => {
			const index = tabs.value.findIndex((tab) => tab.name === tabName)
			if (index < tabs.value.length - 1) {
				const closedTabs = tabs.value.slice(index + 1).filter((tab) => !tab.affix)
				tabs.value = tabs.value.filter((tab, i) => i <= index || tab.affix)
				closedTabs.forEach((tab) => {
					const cacheIndex = _cachedViews.value.indexOf(tab.name)
					if (cacheIndex > -1) _cachedViews.value.splice(cacheIndex, 1)
				})
			}
		}

		const closeAllTabs = () => {
			tabs.value = tabs.value.filter((tab) => tab.affix)
			_cachedViews.value = tabs.value.map((tab) => tab.name)
			return tabs.value[0]?.path || '/assert/main'
		}

		const refreshCurrentTab = (tabName: string) => {
			const cacheIndex = _cachedViews.value.indexOf(tabName)
			if (cacheIndex > -1) {
				_cachedViews.value.splice(cacheIndex, 1)
			}
			refreshKey.value++
		}

		const addToCache = (tabName: string) => {
			if (!_cachedViews.value.includes(tabName)) {
				_cachedViews.value.push(tabName)
			}
		}

		const setActiveTab = (tabName: string) => {
			activeTab.value = tabName
		}

		const resetTabs = () => {
			tabs.value = []
			_cachedViews.value = []
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
			addToCache,
			setActiveTab,
			resetTabs
		}
	},
	{
		persist: {
			pick: ['tabs', 'activeTab', '_cachedViews']
			// refreshKey 不需要持久化
		}
	}
)
