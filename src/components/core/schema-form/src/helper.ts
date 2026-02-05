import type { RuleObject } from 'ant-design-vue/es/form/'
import type { ComponentType } from './types/component'
import dayjs from 'dayjs'
import { isNumber } from '@/utils/is'
import {
	ARRAY_RULE_COMPONENT_TYPES,
	CHOOSE_COMPONENT_TYPES,
	DATE_COMPONENT_TYPES,
	DATE_RANGE_COMPONENT_TYPES,
	FORM_MESSAGES,
	INPUT_COMPONENT_TYPES
} from './constants'

/**
 * @description: 生成placeholder
 */
export function createPlaceholderMessage(component: ComponentType, label = ''): string {
	if (component.includes('Input') || component.includes('Complete')) {
		return `${FORM_MESSAGES.placeholder.input}${label}`
	}
	if (
		component.includes('Picker') ||
		CHOOSE_COMPONENT_TYPES.includes(component as (typeof CHOOSE_COMPONENT_TYPES)[number])
	) {
		return `${FORM_MESSAGES.placeholder.select}${label}`
	}
	return ''
}

/**
 * @description: 设置组件规则类型
 */
export function setComponentRuleType(rule: RuleObject, component: ComponentType, valueFormat: string): void {
	if (DATE_COMPONENT_TYPES.includes(component as (typeof DATE_COMPONENT_TYPES)[number])) {
		rule.type = valueFormat ? 'string' : 'object'
	} else if (ARRAY_RULE_COMPONENT_TYPES.includes(component as (typeof ARRAY_RULE_COMPONENT_TYPES)[number])) {
		rule.type = 'array'
	} else if (component === 'InputNumber') {
		rule.type = 'number'
	}
}

/**
 * @description: 处理InputNumber组件值（数字转字符串）
 */
export function handleInputNumberValue(component?: string, val?: unknown): unknown {
	if (!component) {
		return val
	}
	if (INPUT_COMPONENT_TYPES.includes(component as (typeof INPUT_COMPONENT_TYPES)[number])) {
		return val && isNumber(val) ? `${val}` : val
	}
	return val
}

/**
 * @description: 处理日期值
 */
export function processDateValue(attr: Recordable, component: string): void {
	const { valueFormat, value } = attr
	if (!valueFormat && DATE_COMPONENT_TYPES.includes(component as (typeof DATE_COMPONENT_TYPES)[number]) && value) {
		attr.value = dayjs(value)
	}
}

/**
 * 日期类型字段
 */
export const dateItemType: readonly string[] = [...DATE_RANGE_COMPONENT_TYPES]
