import type { NamePath } from 'ant-design-vue/lib/form/interface'
import type { SchemaFormEmitFn, SchemaFormProps } from '../schema-form'
import type { FormSchema } from '../types/form'
import type { RenderCallbackParams } from '../types'
import type { FormState } from './useFormState'
import dayjs from 'dayjs'
import { cloneDeep, isNil, set, uniqBy, unset } from 'lodash-es'
import { toRaw, unref } from 'vue'
import { deepMerge } from '@/utils/merge'
import { isArray, isFunction, isObject, isString } from '@/utils/is'
import { dateItemType, handleInputNumberValue } from '../helper'

interface UseFormMethodsPayload {
	formState: FormState
	emit: SchemaFormEmitFn
}

export type FormMethods = ReturnType<typeof useFormMethods>

export const useFormMethods = (payload: UseFormMethodsPayload) => {
	const { formState, emit } = payload
	const {
		compRefMap,
		formModel,
		formPropsRef,
		cacheFormModel,
		schemaFormRef,
		getFormProps,
		defaultFormValues,
		originComponentPropsFnMap
	} = formState

	/**
	 * 将所有的表单组件实例保存起来, 方便外面通过表单组件实例操作
	 */
	const setItemRef = (field: string) => {
		return (el: unknown) => {
			if (el) {
				compRefMap.set(field, el)
			}
		}
	}

	function getFieldsValue(): Recordable {
		const formEl = unref(schemaFormRef)
		if (!formEl) {
			return {}
		}
		return handleFormValues(toRaw(unref(formModel)))
	}

	/**
	 * @description: Is it time
	 */
	function itemIsDateType(key: string): boolean {
		const schemas = unref(formPropsRef).schemas as Recordable[]
		return (
			schemas?.some((item: Recordable) => {
				return item.field === key && isString(item.component)
					? dateItemType.includes(item.component as string)
					: false
			}) ?? false
		)
	}

	/**
	 * @description: 设置表单字段值
	 */
	async function setFieldsValue(values: Recordable): Promise<void> {
		const schemas = unref(formPropsRef).schemas as Recordable[]
		const fields = schemas.map((item: Recordable) => item.field).filter(Boolean) as string[]

		Object.assign(cacheFormModel, values)

		const validKeys: string[] = []
		Object.entries(values).forEach(([key, value]) => {
			const schema = schemas.find((item: Recordable) => item.field === key) as Recordable | undefined

			const hasKey = Reflect.has(values, key)
			if (isString(schema?.component)) {
				value = handleInputNumberValue(schema?.component as string, value)
			}
			// 0| '' is allow
			if (hasKey && fields.includes(key)) {
				// time type
				if (itemIsDateType(key)) {
					if (Array.isArray(value)) {
						const arr: (ReturnType<typeof dayjs> | null)[] = []
						for (const ele of value) {
							arr.push(ele ? dayjs(ele) : null)
						}
						set(formModel, key, arr)
					} else {
						const { componentProps } = schema || {}
						let _props = componentProps as Recordable | undefined
						if (isFunction(componentProps)) {
							_props = componentProps({ formPropsRef, formModel } as unknown as RenderCallbackParams)
						}
						set(formModel, key, value ? (_props?.valueFormat ? value : dayjs(value)) : null)
					}
				} else {
					set(formModel, key, value)
				}
				validKeys.push(key)
			}
		})
		// console.log('formModel', formModel);
		await validateFields(validKeys).catch(() => {})
	}

	async function resetSchema(data: Partial<FormSchema> | Partial<FormSchema>[]) {
		let updateData: Partial<FormSchema>[] = []
		if (isObject(data)) {
			updateData.push(data as FormSchema)
		}
		if (isArray(data)) {
			updateData = [...data]
		}
		unref(formPropsRef).schemas = updateData as FormSchema[]
	}

	/**
	 * @description: 插入到指定 field 后面，如果没传指定 field，则插入到最后,当 first = true 时插入到第一个位置
	 */
	async function appendSchemaByField(schemaItem: FormSchema, prefixField?: string, first = false) {
		const schemaList = [...unref(formPropsRef).schemas] as FormSchema[]

		const index = schemaList.findIndex((schema) => schema.field === prefixField)

		if (!prefixField || index === -1 || first) {
			first ? schemaList.unshift(schemaItem) : schemaList.push(schemaItem)
			;(formPropsRef.value as Recordable).schemas = schemaList
			return
		}
		if (index !== -1) {
			schemaList.splice(index + 1, 0, schemaItem)
		}
		;(formPropsRef.value as Recordable).schemas = schemaList
		setDefaultValue(schemaList)
	}

	/**
	 * @description: 根据 field 删除 Schema
	 */
	async function removeSchemaByField(fields: string | string[]): Promise<void> {
		const schemaList = [...unref(formPropsRef).schemas] as FormSchema[]

		if (!fields) {
			return
		}

		const fieldList: string[] = isString(fields) ? [fields] : fields
		for (const field of fieldList) {
			const index = schemaList.findIndex((schema) => schema.field === field)
			if (index !== -1) {
				unset(formModel, field)
				schemaList.splice(index, 1)
			}
		}

		;(formPropsRef.value as Recordable).schemas = schemaList
	}

	/**
	 * @description: 根据 field 查找 Schema
	 */
	function getSchemaByField(field: string): FormSchema | undefined {
		const schemas = unref(formPropsRef).schemas as FormSchema[]
		return schemas.find((schema) => field === schema.field)
	}

	/**
	 * @description  更新formItemSchema
	 */
	const updateSchema = (data: Partial<FormSchema> | Partial<FormSchema>[]) => {
		let updateData: Partial<FormSchema>[] = []
		if (isObject(data)) {
			updateData.push(data as FormSchema)
		}
		if (isArray(data)) {
			updateData = [...data]
		}

		const hasField = updateData.every(
			(item) => item.component === 'Divider' || (Reflect.has(item, 'field') && item.field)
		)

		if (!hasField) {
			console.error(
				'All children of the form Schema array that need to be updated must contain the `field` field'
			)
			return
		}
		const schemas: FormSchema[] = []
		const updatedSchemas: FormSchema[] = []

		const currentSchemas = unref(formPropsRef).schemas as FormSchema[]
		currentSchemas.forEach((val) => {
			const updateItem = updateData.find((n) => val.field === n.field)
			if (updateItem) {
				const compProps = updateItem.componentProps
				const newSchema = deepMerge(val, updateItem)

				if (originComponentPropsFnMap.has(val.field)) {
					const originCompPropsFn = originComponentPropsFnMap.get(val.field)!

					;(newSchema as Recordable).componentProps = (opt: RenderCallbackParams) => {
						return {
							...originCompPropsFn(opt),
							...(isFunction(compProps) ? compProps(opt) : compProps)
						}
					}
				}

				updatedSchemas.push(newSchema)
				schemas.push(newSchema)
			} else {
				schemas.push(val)
			}
		})

		setDefaultValue(updatedSchemas)
		;(formPropsRef.value as Recordable).schemas = uniqBy<FormSchema>(schemas, 'field')
	}

	function setDefaultValue(data: FormSchema | FormSchema[]) {
		let schemas: FormSchema[] = []
		if (isObject(data)) {
			schemas.push(data as FormSchema)
		}
		if (isArray(data)) {
			schemas = [...data]
		}

		const obj: Recordable = {}
		const currentFieldsValue = getFieldsValue()
		schemas.forEach((item) => {
			if (
				item.component !== 'Divider' &&
				Reflect.has(item, 'field') &&
				item.field &&
				!isNil(item.defaultValue) &&
				(!(item.field in currentFieldsValue) || isNil(currentFieldsValue[item.field]))
			) {
				obj[item.field] = item.defaultValue
			}
		})
		setFieldsValue(obj)
	}

	async function resetFields(): Promise<void> {
		const { resetFunc, submitOnReset } = unref(getFormProps)

		if (isFunction(resetFunc)) {
			await resetFunc()
		}

		Object.keys(formModel).forEach((key) => {
			set(formModel, key, defaultFormValues[key])
		})

		emit('reset', formModel)
		submitOnReset && handleSubmit()
		setTimeout(clearValidate)
	}

	async function validateFields(nameList?: NamePath[] | undefined) {
		return schemaFormRef.value?.validateFields(nameList)
	}

	async function validate(nameList?: NamePath[] | undefined) {
		return await schemaFormRef.value!.validate(nameList)
	}

	async function clearValidate(name?: string | string[]) {
		await schemaFormRef.value?.clearValidate(name)
	}

	async function scrollToField(name: NamePath, options?: ScrollOptions | undefined) {
		await schemaFormRef.value?.scrollToField(name, options)
	}

	/**
	 * 设置某个字段的值
	 */
	const setFormModel = (key: Key, value: unknown): void => {
		set(formModel, key, value)
		set(cacheFormModel, key, value)
		const { validateTrigger } = unref(getFormProps)
		if (!validateTrigger || validateTrigger === 'change') {
			schemaFormRef.value?.validateFields([key])
		}
	}

	/**
	 * 删除某个字段
	 */
	const delFormModel = (key: Key) => {
		return unset(formModel, key)
	}

	const setSchemaFormProps = (formProps: Partial<SchemaFormProps>): void => {
		const schemas = (formPropsRef.value as Recordable).schemas as FormSchema[]
		;(formPropsRef as Recordable).value = deepMerge(unref(formPropsRef) || {}, formProps)
		;(formPropsRef.value as Recordable).schemas = schemas?.length ? schemas : cloneDeep(formProps.schemas ?? [])
	}

	/**
	 * Processing form values
	 */
	function handleFormValues(values: Recordable) {
		if (!isObject(values)) {
			return {}
		}
		const res: Recordable = {}
		for (const [key, originalValue] of Object.entries(values)) {
			let value = originalValue
			if (!key || (isArray(value) && value.length === 0) || isFunction(value)) {
				continue
			}

			const { transformDateFunc } = unref(getFormProps)
			if (isObject(value)) {
				value = transformDateFunc?.(value)
			}

			if (isArray(value) && value[0]?.format && value[1]?.format) {
				value = value.map((item) => transformDateFunc?.(item))
			}
			// Remove spaces
			if (isString(value)) {
				value = value.trim()
			}

			const schemaItem = getSchemaByField(key)

			if (isFunction(schemaItem?.transform)) {
				value = schemaItem?.transform(value)
				if (isObject(value)) {
					Object.assign(res, value)
					Reflect.deleteProperty(res, key)
					continue
				}
			}

			set(res, key, value)
		}
		return handleRangeTimeValue(res)
	}

	/**
	 * @description: Processing time interval parameters
	 */
	function handleRangeTimeValue(values: Recordable): Recordable {
		const fieldMapToTime = unref(getFormProps).fieldMapToTime

		if (!fieldMapToTime || !Array.isArray(fieldMapToTime)) {
			return values
		}

		for (const [field, [startTimeKey, endTimeKey], format = 'YYYY-MM-DD'] of fieldMapToTime) {
			if (!field || !startTimeKey || !endTimeKey || !values[field]) {
				continue
			}

			const [startTime, endTime]: string[] = values[field]
			if (!startTime || !endTime) {
				Reflect.deleteProperty(values, field)
				continue
			}
			values[startTimeKey] = dayjs(startTime).format(format)
			values[endTimeKey] = dayjs(endTime).format(format)
			Reflect.deleteProperty(values, field)
		}

		return values
	}

	const handleEnterPress = (e: KeyboardEvent) => {
		const { autoSubmitOnEnter } = unref(formPropsRef)
		if (!autoSubmitOnEnter) {
			return
		}
		if (e.key === 'Enter' && e.target && e.target instanceof HTMLElement) {
			const target: HTMLElement = e.target as HTMLElement
			if (target && target.tagName && target.tagName.toUpperCase() === 'INPUT') {
				handleSubmit(e)
			}
		}
	}

	async function handleSubmit(e?: Event): Promise<Recordable | undefined> {
		e?.preventDefault?.()
		const { submitFunc } = unref(getFormProps)
		if (submitFunc && isFunction(submitFunc)) {
			await submitFunc()
			return
		}
		const formEl = unref(schemaFormRef)
		if (!formEl) {
			return
		}
		try {
			const values = await validate()
			const res = handleFormValues(values)
			emit('submit', res)
			return res
		} catch (error: unknown) {
			return Promise.reject(error)
		}
	}

	return {
		submit: handleSubmit,
		setItemRef,
		clearValidate,
		validate,
		validateFields,
		getFieldsValue,
		updateSchema,
		resetSchema,
		getSchemaByField,
		appendSchemaByField,
		removeSchemaByField,
		resetFields,
		setFieldsValue,
		scrollToField,
		setDefaultValue,
		setFormModel,
		delFormModel,
		setSchemaFormProps,
		handleFormValues,
		handleEnterPress
	}
}
