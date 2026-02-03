<script setup lang="ts">
import { useTabsStore } from '@/stores/tabs'
import { useSettingStore } from '@/stores/setting'
import { useUserStore } from '@/stores/user'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()
const tabsStore = useTabsStore()
const settingStore = useSettingStore()
const userStore = useUserStore()

const isRefreshing = ref(false)

const primaryColor = computed(() => settingStore.themeConfig.token?.colorPrimary || '#1677ff')

// 判断是否有侧边栏
const hasSideMenu = computed(() => {
	const activeTop = settingStore.activeTopMenu
	if (!activeTop) return false
	const parentMenu = userStore.menus.find((m) => m.name === activeTop)
	return (parentMenu?.children || []).length > 0
})

// 计算左侧偏移
const tabsMarginLeft = computed(() => {
	if (hasSideMenu.value) {
		return settingStore.menuCollapsed ? '80px' : '220px'
	}
	return '0px'
})

// 下拉菜单选项
const dropdownItems = computed(() => [
	{
		key: 'closeOther',
		label: '关闭其他',
		icon: 'ant-design:close-outlined'
	},
	{
		key: 'closeLeft',
		label: '关闭左侧',
		icon: 'ant-design:vertical-right-outlined'
	},
	{
		key: 'closeRight',
		label: '关闭右侧',
		icon: 'ant-design:vertical-left-outlined'
	},
	{
		key: 'closeAll',
		label: '关闭所有',
		icon: 'ant-design:minus-outlined'
	}
])

// 点击标签
const handleTabClick = (tabName: string) => {
	const tab = tabsStore.tabs.find((t) => t.name === tabName)
	if (tab) {
		tabsStore.setActiveTab(tabName)
		router.push(tab.path)
	}
}

// 关闭标签
const handleCloseTab = (tabName: string, e?: MouseEvent) => {
	e?.stopPropagation()
	const nextPath = tabsStore.closeTab(tabName)
	if (nextPath) {
		router.push(nextPath)
	}
}

// 下拉菜单操作
const handleDropdownAction = (key: string) => {
	const tabName = tabsStore.activeTab
	switch (key) {
		case 'closeOther':
			tabsStore.closeOtherTabs(tabName)
			break
		case 'closeLeft':
			tabsStore.closeLeftTabs(tabName)
			break
		case 'closeRight':
			tabsStore.closeRightTabs(tabName)
			break
		case 'closeAll': {
			const path = tabsStore.closeAllTabs()
			router.push(path)
			break
		}
	}
}

// 刷新当前页
const handleRefresh = async (e: MouseEvent) => {
	e.stopPropagation()
	if (isRefreshing.value) return

	isRefreshing.value = true
	settingStore.contentLoading = true
	await tabsStore.refreshCurrentTab(tabsStore.activeTab)

	setTimeout(() => {
		isRefreshing.value = false
		settingStore.contentLoading = false
	}, 600)
}

// 监听路由变化，自动添加标签
watch(
	() => route.path,
	() => {
		if (route.name) {
			tabsStore.addTab(route)
		}
	},
	{ immediate: true }
)
</script>

<template>
	<div
		class="tabs-container"
		:style="{
			'--tabs-primary-color': primaryColor,
			marginLeft: tabsMarginLeft
		}"
	>
		<a-tabs
			:active-key="tabsStore.activeTab"
			type="editable-card"
			size="small"
			:hide-add="true"
			class="custom-pro-tabs min-w-0 flex-1"
			@change="(key: any) => handleTabClick(key)"
			@edit="(key: any, action: string) => action === 'remove' && handleCloseTab(key)"
		>
			<a-tab-pane v-for="tab in tabsStore.tabs" :key="tab.name" :closable="!tab.affix">
				<template #tab>
					<div class="group flex items-center gap-1">
						<span>{{ tab.title }}</span>
						<Icon
							v-if="tabsStore.activeTab === tab.name"
							icon="ant-design:reload-outlined"
							class="cursor-pointer text-12px text-[var(--tabs-primary-color)] transition-opacity hover:opacity-80"
							:class="{ 'animate-spin': isRefreshing && tabsStore.activeTab === tab.name }"
							@click="handleRefresh"
						/>
					</div>
				</template>
			</a-tab-pane>
		</a-tabs>

		<div
			class="tabs-actions z-10 ml-2 h-full flex flex-shrink-0 items-center border-l border-[#f0f0f0] pl-2 dark:border-[#303030]"
		>
			<a-dropdown :trigger="['click']">
				<div
					class="action-btn h-8 w-8 flex cursor-pointer items-center justify-center rounded transition-colors hover:bg-[rgba(0,0,0,0.04)] dark:hover:bg-white/10"
				>
					<Icon icon="ant-design:more-outlined" class="text-gray-400" />
				</div>
				<template #overlay>
					<a-menu @click="({ key }: any) => handleDropdownAction(key)">
						<a-menu-item v-for="item in dropdownItems" :key="item.key">
							<div class="flex items-center gap-2">
								<Icon :icon="item.icon" />
								<span>{{ item.label }}</span>
							</div>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>
		</div>
	</div>
</template>

<style lang="less" scoped>
.tabs-container {
	display: flex;
	align-items: flex-end; /* 关键：保持 Tabs 底对齐 */
	height: 40px;
	background: #fff;
	padding: 0 16px;
	padding-bottom: 0;
	transition: margin-left 0.2s ease-in-out;
	border-bottom: 1px solid #f0f0f0;

	:deep(.custom-pro-tabs) {
		.ant-tabs-nav {
			margin: 0 !important;
			&::before {
				display: none;
			}
		}

		.ant-tabs-tab {
			background: #fafafa;
			border: 1px solid #f0f0f0 !important;
			border-bottom: none !important;
			margin-right: 4px !important;
			transition: all 0.2s;
			border-radius: 4px 4px 0 0 !important;
			padding: 6px 12px !important; /* 增加内边距使标签更大 */

			/* 修改点：针对 Ant Design 默认关闭按钮的样式覆盖 */
			.ant-tabs-tab-remove {
				margin-left: 4px !important; /* 缩小文字和关闭按钮的间距 */
				margin-right: -4px !important; /* 抵消部分右边距 */
				width: 16px !important; /* 强制缩小按钮点击热区宽度 */
				padding: 0;
				color: rgba(0, 0, 0, 0.45);

				&:hover {
					color: rgba(0, 0, 0, 0.85);
				}
			}

			&-active {
				background: #fff !important;
				/* 修改点：去除 font-weight: 500 */
				.ant-tabs-tab-btn {
					color: var(--tabs-primary-color) !important;
				}
			}
		}
	}
}

.dark .tabs-container {
	background: #141414;
	border-bottom-color: #303030;
	:deep(.custom-pro-tabs) {
		.ant-tabs-tab {
			background: #1f1f1f;
			border-color: #303030 !important;

			.ant-tabs-tab-remove {
				color: rgba(255, 255, 255, 0.45);
				&:hover {
					color: rgba(255, 255, 255, 0.85);
				}
			}

			&-active {
				background: #141414 !important;
			}
		}
	}
}
</style>
