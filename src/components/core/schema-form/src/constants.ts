/**
 * 表单组件相关常量
 */

/** 日期类型组件列表 */
export const DATE_COMPONENT_TYPES = ['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker'] as const

/** 日期范围组件类型列表 */
export const DATE_RANGE_COMPONENT_TYPES = [...DATE_COMPONENT_TYPES, 'RangePicker'] as const

/** 输入类型组件列表 */
export const INPUT_COMPONENT_TYPES = ['Input', 'InputPassword', 'InputSearch', 'InputTextArea'] as const

/** 选择类型组件列表（包含options属性） */
export const SELECT_COMPONENT_TYPES = ['Select', 'RadioGroup', 'CheckboxGroup'] as const

/** 树形选择组件列表（包含treeData属性） */
export const TREE_COMPONENT_TYPES = ['TreeSelect', 'Tree'] as const

/** 选择类型组件列表（用于placeholder提示） */
export const CHOOSE_COMPONENT_TYPES = [
	'Select',
	'Cascader',
	'Checkbox',
	'CheckboxGroup',
	'Switch',
	'TreeSelect'
] as const

/** 数组类型规则组件 */
export const ARRAY_RULE_COMPONENT_TYPES = ['RangePicker', 'Upload', 'CheckboxGroup', 'TimePicker'] as const

/** 复选框类型组件（使用checked作为v-model绑定） */
export const CHECK_COMPONENT_TYPES = ['Switch', 'Checkbox'] as const

/** 栅格基础列宽 */
export const BASIC_COL_LEN = 24

/** 默认日期格式 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss'

/** 表单项中文文案 */
export const FORM_MESSAGES = {
	placeholder: {
		input: '请输入',
		select: '请选择'
	},
	button: {
		reset: '重置',
		query: '查询',
		expand: '展开',
		collapse: '收起'
	},
	validation: {
		maxLength: (max: number) => `字符数应小于${max}位`
	},
	loading: '加载中...'
} as const
