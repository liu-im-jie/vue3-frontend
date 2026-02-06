/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RouteRecordRaw } from 'vue-router'

const modules: Record<string, any> = import.meta.glob('/src/views/**/*.vue', { eager: true })

const namedComponentCache = new Map<string, any>()

function getNamedComponent(originalComponent: any, name: string) {
	if (namedComponentCache.has(name)) {
		return namedComponentCache.get(name)!
	}
	const namedComponent = { ...originalComponent, name, __name: name }
	namedComponentCache.set(name, namedComponent)
	return namedComponent
}

/**
 * 根据组件路径获取组件，并给组件设置 name（KeepAlive 依赖 name 进行缓存匹配）
 */
function resolveComponent(componentPath: string, routeName: string) {
	const keysToTry = [`/src/views/${componentPath}.vue`, `/src/views/${componentPath}/index.vue`]
	let foundModule: any = null
	for (const key of keysToTry) {
		if (modules[key]) {
			foundModule = modules[key]
			break
		}
	}
	if (foundModule && routeName) {
		return getNamedComponent(foundModule.default || foundModule, routeName)
	} else if (foundModule) {
		return foundModule.default || foundModule
	}
	return () => import('@/views/error/404.vue')
}

/**
 * 将树形菜单路由扁平化为 Layout 的直接子路由
 * 所有叶子页面都作为 Layout 的直接子路由，由 Layout 的 KeepAlive 统一管理
 */
export function flattenRoutes(menus: RouteRecordRaw[]): RouteRecordRaw[] {
	const result: RouteRecordRaw[] = []

	const walk = (routes: RouteRecordRaw[]) => {
		for (const route of routes) {
			if (route.children && route.children.length > 0) {
				walk(route.children)
			} else {
				// 叶子节点：解析组件并设置 name
				const componentPath = route.meta?.componentPath as string | undefined
				const flatRoute: RouteRecordRaw = {
					path: route.path,
					name: route.name,
					component: componentPath
						? resolveComponent(componentPath, route.name as string)
						: () => import('@/views/error/404.vue'),
					meta: { ...route.meta }
				}
				result.push(flatRoute)
			}
		}
	}

	walk(menus)
	return result
}

/**
 * 获取第一个有效的路由名称（支持树形菜单）
 */
export function findFirstValidRouteName(routes: RouteRecordRaw[]): string | undefined {
	for (const route of routes) {
		if (route.meta?.hideInMenu) continue
		if (route.children && route.children.length > 0) {
			const childName = findFirstValidRouteName(route.children)
			if (childName) return childName
		} else {
			if (route.name) return route.name as string
		}
	}
	return undefined
}
