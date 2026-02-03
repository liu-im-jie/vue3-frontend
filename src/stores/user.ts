import type { LoginParams, UserInfo } from '@/api/model/auth'
import { LOGIN_NAME } from '@/constants/router'
import router, { resetRouter } from '@/router'
import { transformRoutes } from '@/router/routeHelper'
import { PageNotFoundRoute } from '@/router/routes'
import { useTabsStore } from '@/stores/tabs'
import type { RouteRecordRaw } from 'vue-router'

export const useUserStore = defineStore(
	'user',
	() => {
		const token = ref<string>('')
		const userInfo = ref<UserInfo | null>(null)
		const menus = ref<RouteRecordRaw[]>([])
		// 动态路由是否加载完成
		const isDynamicAddedMenu = ref<boolean>(false)

		const setToken = (t: string) => {
			token.value = t
		}

		const login = async (params: LoginParams) => {
			try {
				const res = await loginApi(params)
				setToken(res.token)
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

				const backendResult = [
					{
						path: '/dashboard',
						name: 'Dashboard',
						component: 'dashboard/index',
						meta: { title: '仪表盘', icon: 'ant-design:dashboard-outlined' },
						children: []
					},
					{
						path: '/system',
						name: 'System',
						component: 'Layout',
						meta: { title: '系统管理', icon: 'ant-design:setting-outlined' },
						children: [
							{
								path: 'user',
								name: 'SystemUser',
								component: 'system/user/index',
								meta: { title: '用户管理', icon: 'ant-design:user-outlined' }
							},
							{
								path: 'role',
								name: 'SystemRole',
								component: 'system/role/index',
								meta: { title: '角色管理', icon: 'ant-design:team-outlined' }
							}
						]
					}
				]
				const routeList = transformRoutes(backendResult)
				menus.value = routeList

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
