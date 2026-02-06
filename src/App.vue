<script lang="ts" setup>
import { useSettingStore } from '@/stores/setting'

const settingStore = useSettingStore()

watchEffect(() => {
	document.documentElement.style.setProperty('--primary-color', settingStore.colorPrimary)
})
</script>

<template>
	<ProConfigProvider>
		<router-view />
	</ProConfigProvider>
</template>

<style>
#app {
	height: 100%;
	width: 100%;
}
</style>
