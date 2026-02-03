import type { RouteRecordRaw } from 'vue-router'
import { LOGIN_NAME, PAGE_NOT_FOUND_NAME, REDIRECT_NAME } from '@/constants/router'

export const RootRoute: RouteRecordRaw = {
	path: '/',
	name: 'Root',
	component: () => import('@/layout/index.vue'),
	meta: {
		title: 'Root'
	},
	children: []
}

export const LoginRoute: RouteRecordRaw = {
	path: '/login',
	name: LOGIN_NAME,
	component: () => import('@/views/login/index.vue'),
	meta: {
		title: '登录'
	}
}

export const PageNotFoundRoute: RouteRecordRaw = {
	path: '/:pathMatch(.*)*',
	name: PAGE_NOT_FOUND_NAME,
	component: () => import('@/views/error/404.vue'),
	meta: {
		title: 'ErrorPage',
		hideInMenu: true
	}
}

export const RedirectRoute: RouteRecordRaw = {
	path: '/redirect/:path(.*)',
	component: () => import('@/layout/index.vue'),
	meta: {
		title: REDIRECT_NAME,
		hideInMenu: true
	},
	children: [
		{
			path: '',
			name: REDIRECT_NAME,
			component: () => import('@/views/redirect/index.vue'),
			meta: { hideInMenu: true }
		}
	]
}

export const basicRoutes: RouteRecordRaw[] = [LoginRoute, RootRoute, RedirectRoute]
