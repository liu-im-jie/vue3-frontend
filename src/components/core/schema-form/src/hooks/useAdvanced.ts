import type { SchemaFormEmitFn } from '../schema-form'
import type { ColEx } from '../types/component'
import type { FormSchema, RenderCallbackParams } from '../types/form'
import type { FormState } from './useFormState'
import { computed, unref, watch } from 'vue'
import { useBreakpoint } from '@/hooks/useBreakpoint'
import { isBoolean, isFunction, isNumber, isObject } from '@/utils/is'
import { useFormContext } from './useFormContext'
import { BASIC_COL_LEN } from '../constants'

interface UseAdvancedPayload {
	formState: FormState
	emit: SchemaFormEmitFn
}

export const useAdvanced = (payload: UseAdvancedPayload) => {
	const { formState, emit } = payload
	const formContext = useFormContext()
	const { realWidthRef, screenEnum, screenRef } = useBreakpoint()
	const { advanceState, getFormProps, formPropsRef, formModel, defaultFormValues } = formState

	const getEmptySpan = computed((): number => {
		if (!advanceState.isAdvanced) {
			return 0
		}
		// For some special cases, you need to manually specify additional blank lines
		const emptySpan = unref(getFormProps).emptySpan || 0

		if (isNumber(emptySpan)) {
			return emptySpan
		}
		if (isObject(emptySpan)) {
			const emptySpanObj = emptySpan as { span?: number; [key: string]: number | undefined }
			const { span = 0 } = emptySpanObj
			const screen = unref(screenRef) as string

			const screenSpan = emptySpanObj[screen.toLowerCase()]
			return screenSpan || span || 0
		}
		return 0
	})

	watch(
		[() => formPropsRef.value.schemas, () => advanceState.isAdvanced, () => unref(realWidthRef)],
		() => {
			const { showAdvancedButton } = unref(getFormProps)
			if (showAdvancedButton) {
				updateAdvanced()
			}
		},
		{ immediate: true }
	)

	function getAdvanced(itemCol: Partial<ColEx>, itemColSum = 0, isLastAction = false) {
		const width = unref(realWidthRef)

		const mdWidth =
			Number.parseInt(itemCol.md as string) ||
			Number.parseInt(itemCol.xs as string) ||
			Number.parseInt(itemCol.sm as string) ||
			(itemCol.span as number) ||
			BASIC_COL_LEN

		const lgWidth = Number.parseInt(itemCol.lg as string) || mdWidth
		const xlWidth = Number.parseInt(itemCol.xl as string) || lgWidth
		const xxlWidth = Number.parseInt(itemCol.xxl as string) || xlWidth
		if (width <= screenEnum.LG) {
			itemColSum += mdWidth
		} else if (width < screenEnum.XL) {
			itemColSum += lgWidth
		} else if (width < screenEnum.XXL) {
			itemColSum += xlWidth
		} else {
			itemColSum += xxlWidth
		}

		if (isLastAction) {
			advanceState.hideAdvanceBtn = false
			if (itemColSum <= BASIC_COL_LEN * 2) {
				// When less than or equal to 2 lines, the collapse and expand buttons are not displayed
				advanceState.hideAdvanceBtn = true
				advanceState.isAdvanced = true
			} else if (
				itemColSum > BASIC_COL_LEN * 2 &&
				itemColSum <= BASIC_COL_LEN * (unref(getFormProps).autoAdvancedLine || 3)
			) {
				advanceState.hideAdvanceBtn = false

				// More than 3 lines collapsed by default
			} else if (!advanceState.isLoad) {
				advanceState.isLoad = true
				advanceState.isAdvanced = !advanceState.isAdvanced
			}
			return { isAdvanced: advanceState.isAdvanced, itemColSum }
		}
		if (itemColSum > BASIC_COL_LEN * (unref(getFormProps).alwaysShowLines || 1)) {
			return { isAdvanced: advanceState.isAdvanced, itemColSum }
		} else {
			// The first line is always displayed
			return { isAdvanced: true, itemColSum }
		}
	}

	function updateAdvanced() {
		let itemColSum = 0
		let realItemColSum = 0
		const { baseColProps = {} } = unref(getFormProps)

		for (const schema of unref(formPropsRef).schemas) {
			const { vShow, colProps } = schema
			let isShow = true

			if (isBoolean(vShow)) {
				isShow = vShow
			}

			if (isFunction(vShow)) {
				const schemas = unref(formPropsRef).schemas as FormSchema[]
				isShow = vShow({
					schema: computed(() => {
						return schemas.find((n) => n.field === schema.field)!
					}),
					formModel,
					field: schema.field,
					formInstance: formContext,
					values: {
						...unref(defaultFormValues),
						...formModel
					}
				} as RenderCallbackParams)
			}

			if (isShow && (colProps || baseColProps)) {
				const { itemColSum: sum, isAdvanced } = getAdvanced({ ...baseColProps, ...colProps }, itemColSum)

				itemColSum = sum || 0
				if (isAdvanced) {
					realItemColSum = itemColSum
				}

				schema.isAdvanced = isAdvanced
			}
		}

		advanceState.actionSpan = (realItemColSum % BASIC_COL_LEN) + unref(getEmptySpan)

		getAdvanced(unref(getFormProps).actionColOptions || { span: BASIC_COL_LEN }, itemColSum, true)

		emit('advancedChange')
	}

	function handleToggleAdvanced() {
		advanceState.isAdvanced = !advanceState.isAdvanced
	}

	return { handleToggleAdvanced }
}
