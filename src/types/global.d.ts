/* eslint-disable @typescript-eslint/no-explicit-any */
declare const __APP_INFO__: {
	pkg: {
		name: string
		version: string
		dependencies: Record<string, string>
		devDependencies: Record<string, string>
	}
	lastBuildTime: string
}

declare type Recordable<T = any> = Record<string, T>
declare type Objectable<T> = { [K in keyof T]: T[K] }
declare type Key = string | number
declare type Fn = (...args: any[]) => any
declare type PromiseFn<P = any, R = any> = (params: P) => Promise<R>
declare type Writable<T> = { -readonly [K in keyof T]: T[K] }
