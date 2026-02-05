import type { FormSchema } from './types'

export const schemaFormItemProps = {
	formModel: {
		type: Object as PropType<Record<string, unknown>>,
		default: () => ({})
	},
	schema: {
		type: Object as PropType<FormSchema>,
		default: () => ({})
	}
}

export type SchemaFormItemProps = typeof schemaFormItemProps
