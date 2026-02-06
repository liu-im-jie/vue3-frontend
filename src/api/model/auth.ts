// 登录请求
export interface LoginParams {
	username: string
	password: string
	captcha?: string
}

// 登录响应
export interface LoginResponse {
	token: string
	expireSeconds: number
}

// 用户信息
export interface UserInfo {
	userId: number
	username: string
	nickname: string
	avatar?: string
	email?: string
	phone?: string
	roleId: number
	orgId: number
	appUserId?: number
	status: number
	password?: string
}

// 角色信息
export interface RoleInfo {
	roleId: number
	roleName: string
	parentRole?: number
	routeIds?: string
	status: number
	remark?: string
}

// 路由信息
export interface RouteInfo {
	name: string
	title: string
	router: string
	comPath: string
	order: number
	icon?: string
	type: number
	children: RouteInfo[]
}
