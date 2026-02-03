/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string
	readonly VITE_USE_DYNAMIC_ROUTES: boolean
	readonly NODE_ENV: 'development' | 'production'
	readonly VITE_BASE_URL: string
	readonly VITE_DROP_CONSOLE: boolean
	readonly VITE_COPYRIGHT: string
}
