import type { FormInstance } from 'ant-design-vue'
import type { SchemaFormProps } from '../schema-form'
import type { RenderCallbackParams } from '../types'
import type { AdvanceState } from '../types/hooks'
import { cloneDeep, isUndefined, set } from 'lodash-es'
import { computed, reactive, ref, unref, useAttrs, watch } from 'vue'
import { isFunction } from '@/utils/is'

export type FormState = ReturnType<typeof useFormState>

export const useFormState = (props: Recordable) => {
	const attrs = useAttrs()
	/** 将formSchema克隆一份，避免修改原有的formSchema */
	const formPropsRef = ref<SchemaFormProps>({ ...props, schemas: cloneDeep(props.schemas) } as SchemaFormProps)
	/** 表单项数据 */
	const formModel = reactive<Recordable>({ ...props.initialValues })
	/** 表单默认数据 */
	const defaultFormValues = reactive<Recordable>({ ...props.initialValues })
	/** 表单实例 */
	const schemaFormRef = ref<FormInstance>()
	/** 缓存的表单值，用于恢复form-item v-if为true后的值 */
	const cacheFormModel: Recordable = { ...props.initialValues }
	/** 将所有的表单组件实例保存起来 */
	const compRefMap = new Map<string, unknown>()
	/** 初始时的componentProps，用于updateSchema更新时不覆盖componentProps为函数时的值 */
	const originComponentPropsFnMap = new Map<string, (opt: RenderCallbackParams) => Recordable>()

	const advanceState = reactive<AdvanceState>({
		isAdvanced: true,
		hideAdvanceBtn: false,
		isLoad: false,
		actionSpan: 6
	})

	// 获取表单所有属性
	const getFormProps = computed(() => {
		return {
			...attrs,
			...formPropsRef.value
		} as SchemaFormProps
	})

	// 获取栅栏Row配置
	const getRowConfig = computed((): Recordable => {
		const { baseRowStyle = {}, rowProps } = unref(getFormProps)
		return {
			style: baseRowStyle,
			...rowProps
		}
	})

	const getFormActionBindProps = computed((): Recordable => ({ ...getFormProps.value, ...advanceState }))

	watch(
		() => formPropsRef.value.schemas,
		() => {
			formPropsRef.value.schemas?.forEach((item) => {
				if (!originComponentPropsFnMap.has(item.field) && isFunction(item.componentProps)) {
					originComponentPropsFnMap.set(
						item.field,
						item.componentProps as (opt: RenderCallbackParams) => Recordable
					)
				}
				if (!isUndefined(item.defaultValue)) {
					set(defaultFormValues, item.field, item.defaultValue)
				}
			})
		}
	)

	return {
		formModel,
		defaultFormValues,
		schemaFormRef,
		formPropsRef,
		cacheFormModel,
		compRefMap,
		getFormProps,
		advanceState,
		getRowConfig,
		getFormActionBindProps,
		originComponentPropsFnMap
	}
}
