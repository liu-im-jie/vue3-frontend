import type { LoginParams, UserInfo } from '@/api/model/auth'
import { LOGIN_NAME } from '@/constants/router'
import router, { resetRouter } from '@/router'
import { flattenRoutes } from '@/router/routeHelper'
import { PageNotFoundRoute } from '@/router/routes'
import { useTabsStore } from '@/stores/tabs'
import type { RouteRecordRaw } from 'vue-router'

export const useUserStore = defineStore(
	'user',
	() => {
		const token = ref<string>('')
		const userInfo = ref<UserInfo | null>(null)
		const menus = ref<Partial<RouteRecordRaw>[]>([])
		const isDynamicAddedMenu = ref<boolean>(false)

		const setToken = (t: string) => {
			token.value = t
		}

		const login = async (params: LoginParams) => {
			try {
				const res = await loginApi(params)
				setToken(res.token)
				await afterLogin()
				return res
			} catch (error) {
				return Promise.reject(error)
			}
		}

		const loginApi = async (params: LoginParams): Promise<{ token: string }> => {
			return {
				token: '123' + params.username
			}
		}

		const afterLogin = async () => {
			try {
				const info = await getUserInfoApi()
				userInfo.value = info

				const menuData: RouteRecordRaw[] = [
					{
						path: '/dashboard',
						name: 'Dashboard',
						meta: {
							title: '仪表盘',
							icon: 'ant-design:dashboard-outlined',
							order: 1,
							componentPath: 'dashboard/index'
						}
					},
					{
						path: '/system',
						name: 'System',
						meta: {
							title: '系统管理',
							icon: 'ant-design:setting-outlined',
							order: 2
						},
						children: [
							{
								path: '/system/user',
								name: 'SystemUser',
								meta: {
									title: '用户管理',
									icon: 'ant-design:user-outlined',
									order: 1,
									componentPath: 'system/user/index'
								}
							},
							{
								path: '/system/role',
								name: 'SystemRole',
								meta: {
									title: '角色管理',
									icon: 'ant-design:team-outlined',
									order: 2,
									componentPath: 'system/role/index'
								}
							}
						]
					}
				]

				menus.value = menuData
				const routeList = flattenRoutes(menuData)

				routeList.forEach((route) => {
					router.addRoute('Root', route)
				})
				router.addRoute(PageNotFoundRoute)

				isDynamicAddedMenu.value = true

				return routeList
			} catch (error) {
				return Promise.reject(error)
			}
		}

		const getUserInfoApi = async (): Promise<UserInfo> => {
			return {
				userId: 1,
				username: 'admin',
				nickname: '管理员',
				roleId: 1,
				orgId: 1,
				status: 0
			}
		}

		const logout = () => {
			token.value = ''
			userInfo.value = null
			menus.value = []
			isDynamicAddedMenu.value = false
			resetRouter()
			const tabsStore = useTabsStore()
			tabsStore.resetTabs()
			localStorage.clear()
			router.replace({ name: LOGIN_NAME })
		}

		return {
			token,
			userInfo,
			menus,
			isDynamicAddedMenu,
			login,
			afterLogin,
			logout
		}
	},
	{
		persist: {
			pick: ['token']
		}
	}
)
