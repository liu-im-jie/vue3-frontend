import {
	defineConfig,
	presetUno,
	presetAttributify,
	presetIcons,
	transformerDirectives,
	transformerVariantGroup
} from 'unocss'

export default defineConfig({
	presets: [
		presetUno(),
		presetAttributify({
			prefix: 'un-',
			prefixedOnly: true
		}),
		presetIcons({
			scale: 1.2,
			warn: true
		})
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
	shortcuts: {
		'wh-full': 'w-full h-full',
		'flex-cc': 'flex justify-center items-center',
		'flex-bc': 'flex justify-between items-center',
		'flex-ac': 'flex justify-around items-center'
	}
})
