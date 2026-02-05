<script lang="ts" setup>
import type { RuleObject } from 'ant-design-vue/es/form/'
import type { ComponentType } from './componentMap'
import type { ComponentProps, CustomRenderFn, FormSchema, RenderCallbackParams } from './types/'
import type { VNode } from 'vue'
import { Col, Divider, Form, Spin } from 'ant-design-vue'
import { cloneDeep, debounce, isEqual } from 'lodash-es'
import { computed, createTextVNode, h, isVNode, nextTick, toRefs, unref, watch } from 'vue'
import BasicHelp from '@/components/base/basic-help/index.vue'
import { isBoolean, isFunction, isObject, isString } from '@/utils/is'
import { componentMap } from './componentMap'
import { createPlaceholderMessage } from './helper'
import { useFormContext } from './hooks/useFormContext'
import { useItemLabelWidth } from './hooks/useLabelWidth'
import { schemaFormItemProps } from './schema-form-item'
import { CHECK_COMPONENT_TYPES, FORM_MESSAGES, SELECT_COMPONENT_TYPES, TREE_COMPONENT_TYPES } from './constants'

defineOptions({
	name: 'SchemaFormItem'
})

const props = defineProps(schemaFormItemProps)
const emit = defineEmits(['update:formModel'])

// schemaForm组件实例
const formContext = useFormContext()
const { formPropsRef, setItemRef, updateSchema, getSchemaByField, appendSchemaByField } = formContext

const { schema } = toRefs(props)

const itemLabelWidthProp = useItemLabelWidth(schema, formPropsRef)

const namePath = computed<string[]>(() => {
	const field = schema.value.field as string
	return field.includes('.') ? field.split('.') : [field]
})

const modelValue = computed({
	get() {
		return namePath.value.reduce((prev, field) => prev?.[field], props.formModel as Recordable)
	},
	set(val) {
		const field = schema.value.field as string
		const pathParts = field.split('.')
		const prop = pathParts.pop()!
		const target = pathParts.reduce((prev, f) => (prev[f] ??= {}), props.formModel as Recordable)
		target[prop] = val
		emit('update:formModel', props.formModel)
	}
})

const modelValueType = computed<string>(() => {
	const { component, componentProps } = schema.value
	if (!isFunction(componentProps) && componentProps?.vModelKey) {
		return componentProps.vModelKey as string
	}
	const isCheck =
		isString(component) && CHECK_COMPONENT_TYPES.includes(component as (typeof CHECK_COMPONENT_TYPES)[number])
	const isUpload = component === 'Upload'
	if (isUpload) return 'file-list'
	if (isCheck) return 'checked'
	return 'value'
})

const getValues = computed(() => {
	const { formModel, schema } = props

	const { mergeDynamicData } = unref(formPropsRef)
	return {
		field: schema.field,
		formInstance: formContext,
		formModel: formModel as Recordable,
		values: {
			...mergeDynamicData,
			...formModel
		} as Recordable,
		schema: computed(() => props.schema)
	} as RenderCallbackParams
})

/** 合并 baseColProps 和 schema.colProps */
const getColProps = computed(() => {
	const { baseColProps = {} } = unref(formPropsRef)
	const { colProps = {} } = unref(schema)
	return { ...baseColProps, ...colProps }
})

const getShow = computed<{ isShow: boolean; isIfShow: boolean }>(() => {
	const { vShow, vIf, isAdvanced = false } = unref(schema)
	const { showAdvancedButton } = unref(formPropsRef)
	const itemIsAdvanced = showAdvancedButton ? (isBoolean(isAdvanced) ? isAdvanced : true) : true

	let isShow = true
	let isIfShow = true

	if (isBoolean(vShow)) {
		isShow = vShow
	}
	if (isBoolean(vIf)) {
		isIfShow = vIf
	}
	if (isFunction(vShow)) {
		isShow = vShow(unref(getValues))
	}
	if (isFunction(vIf)) {
		isIfShow = vIf(unref(getValues))
	}
	isShow = isShow && itemIsAdvanced

	return { isShow, isIfShow }
})

type SlotRenderFn = (...args: unknown[]) => VNode | VNode[] | string | unknown

const vnodeFactory = (
	component: FormSchema['componentSlots'] | FormSchema['component'],
	values: RenderCallbackParams | unknown = unref(getValues)
): VNode | VNode[] | string | Recordable<SlotRenderFn> | unknown => {
	if (isString(component)) {
		return createTextVNode(component)
	} else if (isVNode(component)) {
		return component
	} else if (isFunction(component)) {
		return vnodeFactory((component as CustomRenderFn)(values as RenderCallbackParams))
	} else if (component && isObject(component)) {
		const compKeys = Object.keys(component)
		// 如果是组件对象直接return
		if (compKeys.some((n) => n.startsWith('_') || ['setup', 'render'].includes(n))) {
			return component
		}
		const compRecord = component as Recordable
		return compKeys.reduce<Recordable<SlotRenderFn>>((slots, slotName) => {
			slots[slotName] = (...rest: unknown[]) => vnodeFactory(compRecord[slotName], ...rest)
			return slots
		}, {})
	}
	return component
}

/**
 * @description 当前表单项组件
 */
const getComponent = computed(() => {
	const component = props.schema.component
	return isString(component) ? (componentMap[component] ?? vnodeFactory(component)) : vnodeFactory(component)
})

const getLabel = computed(() => {
	const label = props.schema.label
	return isFunction(label) ? label(unref(getValues)) : label
})

/**
 * @description 表单组件props
 */
const getComponentProps = computed(() => {
	const { schema } = props
	const { component } = schema
	let componentProps: Recordable = schema.componentProps ?? {}

	if (isFunction(schema.componentProps)) {
		componentProps = schema.componentProps(unref(getValues) as RenderCallbackParams) ?? {}
	}

	if (component !== 'RangePicker' && isString(component)) {
		componentProps.placeholder ??= createPlaceholderMessage(component, getLabel.value)
	}
	if (schema.component === 'Divider') {
		componentProps = Object.assign({ type: 'horizontal' }, componentProps, {
			orientation: 'left',
			plain: true
		})
	}
	if (isVNode(getComponent.value)) {
		Object.assign(componentProps, getComponent.value.props)
	}

	return componentProps
})

const getDisable = computed(() => {
	const { disabled: globDisabled } = unref(formPropsRef)
	const { dynamicDisabled } = props.schema
	const { disabled: itemDisabled = false } = unref(getComponentProps)
	let disabled = !!globDisabled || itemDisabled
	if (isBoolean(dynamicDisabled)) {
		disabled = dynamicDisabled
	}
	if (isFunction(dynamicDisabled)) {
		disabled = dynamicDisabled(unref(getValues))
	}
	return disabled
})

/**
 * @description 当前表单项组件的插槽
 */
const getComponentSlots = computed<Recordable<SlotRenderFn>>(() => {
	const componentSlots = props.schema.componentSlots ?? {}
	return isString(componentSlots) || isVNode(componentSlots)
		? {
				default: () => vnodeFactory(componentSlots)
			}
		: (vnodeFactory(componentSlots) as Recordable<SlotRenderFn>)
})

/**
 * @description 表单组件事件
 */
const componentEvents = computed(() => {
	const componentProps = getComponentProps.value
	return Object.keys(componentProps).reduce<Record<string, unknown>>((prev, key) => {
		if (/^on([A-Z])/.test(key)) {
			// e.g: onChange => change
			const eventKey = key.replace(/^on([A-Z])/, '$1').toLocaleLowerCase()
			prev[eventKey] = componentProps[key]
		}
		return prev
	}, {})
})

const renderLabelHelpMessage = computed(() => {
	const { helpMessage, helpComponentProps, subLabel } = props.schema
	const renderLabel = subLabel
		? h('span', {}, [getLabel.value, ' ', h('span', { class: 'text-secondary' }, subLabel)])
		: vnodeFactory(getLabel.value)
	const getHelpMessage = isFunction(helpMessage) ? helpMessage(unref(getValues)) : helpMessage
	if (!getHelpMessage || (Array.isArray(getHelpMessage) && getHelpMessage.length === 0)) {
		return renderLabel
	}
	return h('span', {}, [
		renderLabel as VNode | string,
		h(BasicHelp, { placement: 'top', class: 'mx-1', text: getHelpMessage, ...helpComponentProps })
	])
})

function setComponentRuleType(rule: RuleObject, component: ComponentType, valueFormat: string) {
	if (['DatePicker', 'MonthPicker', 'WeekPicker', 'TimePicker'].includes(component)) {
		rule.type = valueFormat ? 'string' : 'object'
	} else if (['RangePicker', 'Upload', 'CheckboxGroup', 'TimePicker'].includes(component)) {
		rule.type = 'array'
	} else if (['InputNumber'].includes(component)) {
		rule.type = 'number'
	}
}

const getRules = computed(() => {
	const { rules: defRules = [], component, rulesMessageJoinLabel, dynamicRules, required } = props.schema

	if (isFunction(dynamicRules)) {
		return dynamicRules(unref(getValues)) as RuleObject[]
	}

	let rules = cloneDeep<RuleObject[]>(defRules)
	const { rulesMessageJoinLabel: globalRulesMessageJoinLabel } = unref(formPropsRef)

	const joinLabel = Reflect.has(unref(formPropsRef), 'rulesMessageJoinLabel')
		? rulesMessageJoinLabel
		: globalRulesMessageJoinLabel
	const defaultMsg = isString(component)
		? `${createPlaceholderMessage(component, getLabel.value)}${joinLabel ? getLabel.value : ''}`
		: undefined

	const getRequired = isFunction(required) ? required(unref(getValues)) : required

	/** 确保所有规则都有 trigger: 'blur' */
	rules = rules.map((rule) => ({
		...rule,
		trigger: rule.trigger || 'blur'
	}))

	/** 如果是必填项，添加 required 规则（不覆盖已有规则） */
	if (getRequired) {
		const hasRequiredRule = rules.some((rule) => Reflect.has(rule, 'required'))
		if (!hasRequiredRule) {
			rules.unshift({
				required: true,
				message: defaultMsg,
				trigger: 'blur'
			})
		}
	}

	/** 处理已有的 required 规则，补充 message 和 type */
	const requiredRuleIndex: number = rules.findIndex(
		(rule) => Reflect.has(rule, 'required') && !Reflect.has(rule, 'validator')
	)

	if (requiredRuleIndex !== -1 && rules[requiredRuleIndex]) {
		const rule = rules[requiredRuleIndex]

		if (component && isString(component)) {
			if (!Reflect.has(rule, 'type')) {
				rule.type = component === 'InputNumber' ? 'number' : 'string'
			}

			rule.message = rule.message || defaultMsg
			rule.trigger = rule.trigger || 'blur'

			if (component.includes('Input') || component.includes('Textarea')) {
				rule.whitespace = true
			}
			const valueFormat = unref(getComponentProps)?.valueFormat as string | undefined
			setComponentRuleType(rule, component, valueFormat ?? '')
		}
	}

	// Maximum input length rule check
	const characterInx = rules.findIndex((val) => val.max)
	if (characterInx !== -1 && rules[characterInx] && !rules[characterInx]!.validator) {
		rules[characterInx]!.message =
			rules[characterInx]!.message || FORM_MESSAGES.validation.maxLength(rules[characterInx]!.max as number)
	}

	return rules
})

const fetchRemoteData = async (request: (params: RenderCallbackParams) => Promise<unknown>) => {
	try {
		const newSchema = Object.assign(schema.value, {
			loading: true,
			componentProps: {
				...unref(getComponentProps),
				options: []
			}
		})

		updateSchema(newSchema)

		const result = await request(unref(getValues))
		const { component } = unref(schema)
		const componentProps = newSchema.componentProps as ComponentProps

		if (SELECT_COMPONENT_TYPES.includes(component as (typeof SELECT_COMPONENT_TYPES)[number])) {
			componentProps.options = result as ComponentProps['options']
		} else if (TREE_COMPONENT_TYPES.includes(component as (typeof TREE_COMPONENT_TYPES)[number])) {
			componentProps.treeData = result as ComponentProps['treeData']
		}
		if (newSchema.componentProps) {
			;(newSchema.componentProps as ComponentProps).requestResult = result
		}
		newSchema.loading = false
		updateSchema(newSchema)
	} finally {
		await nextTick()
		schema.value.loading = false
	}
}

const initRequestConfig = () => {
	const request = getComponentProps.value.request
	if (request) {
		if (isFunction(request)) {
			fetchRemoteData(request)
		} else {
			const { watchFields = [], options = {}, wait = 0, callback } = request
			const params = watchFields.map((field: string) => () => props.formModel[field])
			watch(
				params,
				debounce(() => {
					fetchRemoteData(callback)
				}, wait),
				{
					...options
				}
			)
		}
	}
}

watch(
	getShow,
	(val, oldVal) => {
		if (!isEqual(val, oldVal) && val.isIfShow && val.isShow) {
			if (!getSchemaByField(props.schema.field)) {
				appendSchemaByField(props.schema)
			}
			initRequestConfig()
		}
	},
	{
		immediate: true
	}
)
</script>

<template>
	<Col v-if="getShow.isIfShow" v-show="getShow.isShow" v-bind="getColProps">
		<Divider v-if="schema.component === 'Divider'" v-bind="Object.assign(getComponentProps)">
			<component :is="renderLabelHelpMessage" />
		</Divider>
		<Form.Item
			v-else
			:label="renderLabelHelpMessage"
			:name="namePath"
			:rules="getRules"
			:validate-trigger="['blur']"
			v-bind="{ ...schema.formItemProps, ...itemLabelWidthProp }"
		>
			<!-- 前置插槽 -->
			<template v-if="schema.beforeSlot">
				<slot v-if="isString(schema.beforeSlot)" :name="schema.beforeSlot" v-bind="getValues">
					<span class="mr-[6px]">{{ schema.beforeSlot }}</span>
				</slot>
				<component :is="schema.beforeSlot(getValues)" v-if="isFunction(schema.beforeSlot)" />
			</template>
			<!-- 自定义插槽 -->
			<slot v-if="schema.slot" :name="schema.slot" v-bind="getValues" />
			<template v-else-if="getComponent">
				<component
					:is="getComponent"
					:ref="setItemRef(schema.field)"
					v-model:[modelValueType]="modelValue"
					:allow-clear="true"
					:disabled="getDisable"
					:loading="schema.loading"
					v-bind="getComponentProps"
					v-on="componentEvents"
				>
					<template v-if="Object.is(schema.loading, true)" #notFoundContent>
						<Spin size="small" />
					</template>
					<template v-for="(slotFn, slotName) in getComponentSlots" :key="slotName" #[slotName]="slotData">
						<component :is="slotFn?.({ ...getValues, slotData }) ?? slotFn" :key="slotName" />
					</template>
				</component>
			</template>
			<!-- 后置插槽 -->
			<template v-if="schema.afterSlot">
				<slot v-if="isString(schema.afterSlot)" :name="schema.afterSlot" v-bind="getValues">
					<span class="ml-[6px]">{{ schema.afterSlot }}</span>
				</slot>
				<component :is="schema.afterSlot(getValues)" v-if="isFunction(schema.afterSlot)" />
			</template>
		</Form.Item>
	</Col>
</template>

<style lang="less" scoped>
:deep(.ant-form-item-control-input-content) {
	display: flex;
	align-items: center;

	> div {
		flex: auto;
	}
}
</style>
