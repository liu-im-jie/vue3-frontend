/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRouter, createWebHistory } from 'vue-router'
import { basicRoutes } from './routes'
import type { App } from 'vue'
import { createRouterGuards } from './guard'
import { whiteNameList } from '@/constants/router'

export const router = createRouter({
	history: createWebHistory(import.meta.env.VITE_APP_BASE_URL),
	routes: basicRoutes,
	scrollBehavior: () => ({ left: 0, top: 0 })
})

export function resetRouter() {
	router.getRoutes().forEach((route) => {
		const { name } = route
		if (name && !whiteNameList.includes(name as any)) {
			router.hasRoute(name) && router.removeRoute(name)
		}
	})
}

export function setupRouter(app: App) {
	app.use(router)
	createRouterGuards(router)
}

export default router
