<script setup lang="ts">
import Logo from './Logo.vue'
import TopMenu from './TopMenu.vue'
import UserTools from './UserTools.vue'
</script>

<template>
	<a-layout-header
		class="fixed left-0 top-0 z-20 h-[48px] w-full flex items-center justify-between leading-[48px] shadow !bg-white !p-0 dark:!bg-[#001529]"
	>
		<Logo />
		<TopMenu />
		<UserTools />
	</a-layout-header>
</template>
