/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, CanceledError } from 'axios'
import { message as $message, Modal } from 'ant-design-vue'
import type { ResOp } from '@/api/model/baseModel'

export interface RequestOptions {
	/** 是否直接返回 data (true: 返回 res.data; false: 返回 res) */
	isReturnResult?: boolean
	/** 是否显示业务错误提示 (默认 false，不显示) */
	showError?: boolean
	/** 额外的请求配置 (如 onUploadProgress 等) */
	axiosConfig?: AxiosRequestConfig
}

const defaultOptions: RequestOptions = {
	isReturnResult: true,
	showError: false
}

const service: AxiosInstance = axios.create({
	baseURL: (import.meta.env.VITE_API_BASE_URL as string) || '/api',
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json;charset=UTF-8'
	}
})

service.interceptors.request.use(
	(config) => {
		// TODO 添加认证 token 等
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

service.interceptors.response.use(
	(response: AxiosResponse) => {
		const res = response.data as ResOp<any>

		if (res.code === 0) {
			return response
		}

		if ([2001].includes(res.code)) {
			Modal.confirm({
				title: '登录已过期',
				content: res.msg || '您的登录状态已过期，请重新登录！',
				okText: '重新登录',
				cancelText: '取消',
				onOk: () => {
					localStorage.clear()
					location.reload()
				}
			})
			return Promise.reject(new Error(res.msg || '登录已过期'))
		}

		const error = new Error(res.msg || 'Unknown Error')
		;(error as any).code = res.code
		;(error as any).data = res.data
		return Promise.reject(error)
	},
	(error) => {
		if (error instanceof CanceledError) {
			return Promise.reject(error)
		}
		let msg = ''
		const status = error?.response?.status
		switch (status) {
			case 400:
				msg = '请求参数错误'
				break
			case 401:
				msg = '未授权，请登录'
				break
			case 403:
				msg = '拒绝访问'
				break
			case 404:
				msg = '请求地址出错'
				break
			case 500:
				msg = '服务器内部错误'
				break
			default:
				msg = error.message || '网络连接故障'
		}
		error.message = msg
		return Promise.reject(error)
	}
)

export function request<T = any>(url: string, data?: any): Promise<T>
export function request<T = any>(url: string, data: any, method: string): Promise<T>
export function request<T = any>(url: string, data: any, method: string, headers: Record<string, any>): Promise<T>
export function request<T = any>(url: string, data: any, method: string, config?: RequestOptions): Promise<T>
export function request<T = any>(
	url: string,
	data: any,
	method: string,
	headers: Record<string, any>,
	config?: RequestOptions
): Promise<T>

export async function request<T = any>(
	url: string,
	data: any = {},
	method: string = 'POST',
	headersOrConfig?: Record<string, any> | RequestOptions,
	config?: RequestOptions
): Promise<T> {
	let headers: Record<string, any> = {}
	let options: RequestOptions = { ...defaultOptions }

	if (headersOrConfig && !config) {
		if (
			'isReturnResult' in headersOrConfig ||
			'showError' in headersOrConfig ||
			'successMsg' in headersOrConfig ||
			'axiosConfig' in headersOrConfig
		) {
			options = { ...options, ...(headersOrConfig as RequestOptions) }
		} else {
			headers = headersOrConfig as Record<string, any>
		}
	} else if (headersOrConfig && config) {
		headers = headersOrConfig as Record<string, any>
		options = { ...options, ...config }
	}

	try {
		const config: AxiosRequestConfig = {
			url,
			method,
			data,
			headers,
			...options.axiosConfig
		}
		if (method.toUpperCase() === 'GET' && data) {
			config.params = data
			config.data = undefined
		}

		const response = await service.request<ResOp<T>>(config)
		const resData = response.data

		if (options.isReturnResult) {
			return resData.data as T
		} else {
			return resData as unknown as T
		}
	} catch (error: any) {
		const msg = error.message || '请求失败'
		if (options.showError) {
			$message.error(msg)
		}
		return Promise.reject(error)
	}
}

export const http = {
	get<T = any>(url: string, params?: any, config?: RequestOptions) {
		return request<T>(url, params, 'GET', {}, config)
	},
	post<T = any>(url: string, data?: any, config?: RequestOptions) {
		return request<T>(url, data, 'POST', {}, config)
	}
}
