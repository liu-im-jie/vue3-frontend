import { defineStore } from 'pinia'
import { PRESET_COLORS } from '@/constants/theme'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import { theme } from 'ant-design-vue'

export const useSettingStore = defineStore(
	'setting',
	() => {
		const isDark = ref<boolean>(false)
		const colorPrimary = ref<string>(PRESET_COLORS[0]?.value || '#1677ff')

		// 侧边栏折叠状态
		const menuCollapsed = ref<boolean>(false)
		// 是否显示标签页
		const showTabs = ref<boolean>(true)
		// 是否显示页脚
		const showFooter = ref<boolean>(true)
		// 当前激活的一级菜单
		const activeTopMenu = ref<string>('')
		// 当前页面是否在刷新
		const contentLoading = ref<boolean>(false)

		const toggleDark = () => {
			isDark.value = !isDark.value
		}
		const setColorPrimary = (color: string) => {
			colorPrimary.value = color
		}
		const toggleMenuCollapsed = () => {
			menuCollapsed.value = !menuCollapsed.value
		}

		const themeConfig = computed<ThemeConfig>(() => ({
			algorithm: isDark.value ? theme.darkAlgorithm : theme.defaultAlgorithm,
			token: { colorPrimary: colorPrimary.value }
		}))

		const setActiveTopMenu = (menuKey: string) => {
			activeTopMenu.value = menuKey
		}

		watch(
			isDark,
			(val) => {
				const html = document.documentElement
				val ? html.classList.add('dark') : html.classList.remove('dark')
			},
			{ immediate: true }
		)

		return {
			isDark,
			colorPrimary,
			menuCollapsed,
			showTabs,
			showFooter,
			themeConfig,
			activeTopMenu,
			contentLoading,
			toggleDark,
			setColorPrimary,
			toggleMenuCollapsed,
			setActiveTopMenu
		}
	},
	{
		persist: true
	}
)
