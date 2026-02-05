<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting'
import { ConfigProvider, App } from 'ant-design-vue'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'

dayjs.locale('zh-cn')
defineOptions({
	name: 'ProConfigProvider'
})

const settingStore = useSettingStore()
const storeTheme = computed(() => {
	return settingStore.themeConfig
})

const props = defineProps<{
	theme?: ThemeConfig
}>()

const finalTheme = computed(() => {
	return {
		...storeTheme.value,
		...props.theme
	}
})
</script>

<template>
	<ConfigProvider :locale="zhCN" :theme="finalTheme">
		<App class="wh-full flex">
			<slot />
		</App>
	</ConfigProvider>
</template>
