// 后端返回的标准结构
export interface ResOp<T> {
	code: number
	msg: string
	data: T
}

// 系统路由信息
export interface RouteInfo {
	routeId: number
	/**
	 * 页面标题
	 */
	title: string
	/**
	 * 图标
	 */
	icon?: string
	/**
	 * 0目录，1路由
	 */
	type: number
	/**
	 * 父路由id
	 */
	parent: number
	/**
	 * 重定向位置
	 */
	redirect?: string
	/**
	 * 路由路径
	 */
	path: string
	/**
	 * 组件路径
	 */
	component?: string
	/**
	 * 排序
	 */
	order?: number
	/**
	 * 是否缓存
	 */
	keepAlive?: boolean
	/**
	 * 是否隐藏左侧菜单
	 */
	hideSideMenu?: boolean
}
