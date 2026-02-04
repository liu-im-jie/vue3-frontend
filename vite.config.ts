import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import dayjs from 'dayjs'
import pkg from './package.json'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import UnoCSS from 'unocss/vite'

import VueDevtools from 'vite-plugin-vue-devtools'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

const { dependencies, devDependencies, name, version } = pkg
const __APP_INFO__ = {
	pkg: { dependencies, devDependencies, name, version },
	lastBuildTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export default defineConfig(({ mode }) => {
	const root = process.cwd()
	const env = loadEnv(mode, root)

	return {
		define: {
			__APP_INFO__: JSON.stringify(__APP_INFO__),
			'process.env': env
		},
		plugins: [
			vue(),
			VueDevtools(),
			UnoCSS(),
			AutoImport({
				imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
				dts: 'src/types/auto-imports.d.ts',
				eslintrc: {
					enabled: true
				}
			}),
			Components({
				dirs: ['src/components'],
				directoryAsNamespace: false,
				dts: 'src/types/components.d.ts',
				resolvers: [
					AntDesignVueResolver({
						importStyle: false
					}),
					IconsResolver({
						prefix: 'icon'
					})
				]
			}),
			Icons({
				autoInstall: true,
				compiler: 'vue3'
			}),
			createSvgIconsPlugin({
				iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
				symbolId: 'icon-[dir]-[name]'
			})
		],
		resolve: {
			alias: {
				'@': fileURLToPath(new URL('./src', import.meta.url))
			}
		},
		css: {
			preprocessorOptions: {
				less: {
					javascriptEnabled: true,
					modifyVars: {}
				}
			}
		},
		server: {
			host: true,
			open: true,
			proxy: {
				'/api': {
					target: env.VITE_BASE_URL,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, '')
				}
			},
			warmup: {
				clientFiles: ['./index.html', './src/{views,components}/*']
			}
		},
		esbuild: {
			drop: mode === 'production' ? ['console', 'debugger'] : []
		},
		build: {
			chunkSizeWarningLimit: 2000,
			minify: 'esbuild',
			rollupOptions: {
				output: {
					chunkFileNames: 'static/js/[name]-[hash].js',
					entryFileNames: 'static/js/[name]-[hash].js',
					assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
				},
				manualChunks: {
					vue: ['vue', 'vue-router', 'pinia'],
					antd: ['ant-design-vue', '@ant-design/icons-vue']
				}
			}
		}
	}
})
