<script setup lang="ts">
defineProps<{
	name: string
	size?: string | number
	color?: string
}>()
</script>

<template>
	<svg
		aria-hidden="true"
		class="svg-icon"
		:style="{
			width: typeof size === 'number' ? `${size}px` : size || '1em',
			height: typeof size === 'number' ? `${size}px` : size || '1em',
			color: color
		}"
	>
		<use :xlink:href="`#icon-${name}`" />
	</svg>
</template>

<style scoped>
.svg-icon {
	fill: currentColor;
	vertical-align: middle;
}
</style>
