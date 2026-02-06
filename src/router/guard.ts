/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Router } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/user'
import { whiteNameList, LOGIN_NAME } from '@/constants/router'
import { findFirstValidRouteName } from './routeHelper'

NProgress.configure({ showSpinner: false })

export function createRouterGuards(router: Router) {
	router.beforeEach(async (to, from, next) => {
		NProgress.start()

		const userStore = useUserStore()
		const token = userStore.token

		if (token) {
			if (to.name === LOGIN_NAME) {
				const firstRouteName = findFirstValidRouteName(userStore.menus)
				if (firstRouteName) {
					next({ name: firstRouteName })
				} else {
					next({ path: '/' })
				}
				NProgress.done()
			} else {
				if (userStore.isDynamicAddedMenu && userStore.menus.length > 0) {
					if (to.path === '/' && to.name === 'Root') {
						const firstRouteName = findFirstValidRouteName(userStore.menus)
						if (firstRouteName) {
							next({ name: firstRouteName, replace: true })
						} else {
							next()
						}
					} else {
						next()
					}
				} else {
					try {
						await userStore.afterLogin()
						if (to.path === '/') {
							const firstRouteName = findFirstValidRouteName(userStore.menus)
							if (firstRouteName) {
								next({ name: firstRouteName, replace: true })
							} else {
								next({ path: '/dashboard', replace: true })
							}
						} else {
							next({ ...to, replace: true })
						}
					} catch (error) {
						console.error('路由守卫获取用户信息或动态路由失败：', error)
						userStore.logout()
						next({ name: LOGIN_NAME })
						NProgress.done()
					}
				}
			}
		} else {
			if (whiteNameList.includes(to.name as any)) {
				next()
			} else {
				next({
					name: LOGIN_NAME,
					query: { redirect: to.fullPath }
				})
				NProgress.done()
			}
		}
	})

	router.afterEach(() => {
		NProgress.done()
	})
}
