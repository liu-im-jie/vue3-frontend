export interface ThemeColor {
	key: string
	title: string
	value: string
}

export const PRESET_COLORS: ThemeColor[] = [
	{ key: 'techBlue', title: '科技蓝 (默认)', value: '#1677ff' },
	{ key: 'dustRed', title: '薄暮红', value: '#F5222D' },
	{ key: 'volcano', title: '火山', value: '#FA541C' },
	{ key: 'sunset', title: '日暮', value: '#FAAD14' },
	{ key: 'cyan', title: '明青', value: '#13C2C2' },
	{ key: 'green', title: '极光绿', value: '#52C41A' },
	{ key: 'geekBlue', title: '极客蓝', value: '#2F54EB' },
	{ key: 'purple', title: '酱紫', value: '#722ED1' }
]
