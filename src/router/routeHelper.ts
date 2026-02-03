/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouteRecordRaw } from 'vue-router'
import { h } from 'vue'
import { RouterView } from 'vue-router'

const modules = import.meta.glob('@/views/**/*.vue')

const ParentRouteContainer = { render: () => h(RouterView) }

/**
 * 转换后端返回的路由配置为 Vue Router 格式
 * @param routes 后端返回的路由配置
 */
export function transformRoutes(routes: any[]): RouteRecordRaw[] {
	const routeList: RouteRecordRaw[] = []

	routes.forEach((route) => {
		const routePath = route.path

		const realRoute: any = {
			path: routePath,
			name: route.name,
			meta: route.meta || {},
			children: undefined,
			component: undefined
		}

		const componentStr = route.component
		if (typeof componentStr === 'string') {
			// Layout 或 ParentView 表示这是一个父级菜单容器
			if (componentStr === 'Layout' || componentStr === 'layout' || componentStr === 'ParentView') {
				realRoute.component = ParentRouteContainer
			} else {
				const componentKey = `/src/views/${componentStr}.vue`
				const componentKeyIndex = `/src/views/${componentStr}/index.vue`

				const loadComponent = modules[componentKey] || modules[componentKeyIndex]

				if (loadComponent) {
					realRoute.component = loadComponent
				} else {
					console.warn(`[Router] 找不到组件: ${componentStr}，请在 src/views/ 下创建对应的 .vue 文件`)
					realRoute.component = () => import('@/views/error/404.vue')
				}
			}
		}

		if (route.children && route.children.length > 0) {
			realRoute.children = transformRoutes(route.children)
		}

		routeList.push(realRoute as RouteRecordRaw)
	})

	return routeList
}
