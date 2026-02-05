import type { Ref } from 'vue'
import type { SchemaFormProps } from '../schema-form'
import type SchemaForm from '../schema-form.vue'
import { isEmpty } from 'lodash-es'
import { nextTick, ref, unref, watch } from 'vue'

type SchemaFormInstance = InstanceType<typeof SchemaForm>

type SchemaFormMethods = {
	[K in keyof SchemaFormInstance]: SchemaFormInstance[K]
}

/**
 * 表单 hook
 * 用于获取表单实例和方法
 */
export function useForm(props?: Partial<SchemaFormProps>) {
	const formRef = ref<SchemaFormInstance>({} as SchemaFormInstance)

	async function getFormInstance(): Promise<SchemaFormInstance> {
		await nextTick()
		const form = unref(formRef)
		if (isEmpty(form)) {
			console.error('未获取表单实例!')
		}
		return form
	}

	watch(
		() => props,
		async () => {
			if (props) {
				await nextTick()
				const formInstance = await getFormInstance()
				formInstance.setSchemaFormProps?.(props)
			}
		},
		{
			immediate: true,
			deep: true,
			flush: 'post'
		}
	)

	const methods = new Proxy<Ref<SchemaFormInstance>>(formRef, {
		get(target, key: string) {
			if (Reflect.has(target, key)) {
				return unref(target)
			}
			if (target.value && Reflect.has(target.value, key)) {
				return Reflect.get(target.value, key)
			}
			return async (...rest: unknown[]) => {
				const form = await getFormInstance()
				const method = form?.[key as keyof SchemaFormInstance]
				if (typeof method === 'function') {
					return method(...rest)
				}
				return undefined
			}
		}
	}) as unknown as SchemaFormMethods

	return {
		formRef,
		methods,
		getFormInstance
	}
}
