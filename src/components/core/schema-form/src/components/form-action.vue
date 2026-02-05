<script lang="ts" setup>
import type { PropType } from 'vue'
import type { ButtonProps as AntdButtonProps } from 'ant-design-vue/es/button'
import type { ColEx } from '../types/component'
import { DownOutlined, UpOutlined } from '@ant-design/icons-vue'
import { Col, Form } from 'ant-design-vue'
import { computed } from 'vue'
import { useFormContext } from '../hooks/useFormContext'
import { FORM_MESSAGES } from '../constants'

type ButtonOptions = Partial<AntdButtonProps> & { text?: string }

defineOptions({
	name: 'FormAction',
	inheritAttrs: false
})

const props = defineProps({
	showActionButtonGroup: {
		type: Boolean,
		default: true
	},
	showResetButton: {
		type: Boolean,
		default: true
	},
	showSubmitButton: {
		type: Boolean,
		default: true
	},
	showAdvancedButton: {
		type: Boolean,
		default: true
	},
	resetButtonOptions: {
		type: Object as PropType<ButtonOptions>,
		default: () => ({})
	},
	submitButtonOptions: {
		type: Object as PropType<ButtonOptions>,
		default: () => ({})
	},
	actionColOptions: {
		type: Object as PropType<Partial<ColEx>>,
		default: () => ({})
	},
	actionSpan: {
		type: Number,
		default: 6
	},
	isAdvanced: Boolean,
	hideAdvanceBtn: Boolean
})

const emit = defineEmits(['toggleAdvanced'])

const { resetFields, submit } = useFormContext()
const actionColOpt = computed(() => {
	const { showAdvancedButton, actionSpan: span, actionColOptions } = props
	const actionSpan = 24 - span
	const advancedSpanObj = showAdvancedButton ? { span: actionSpan < 6 ? 24 : actionSpan } : {}
	const actionColOpt: Partial<ColEx> = {
		style: { textAlign: 'right' },
		span: showAdvancedButton ? 6 : 4,
		...advancedSpanObj,
		...actionColOptions
	}
	return actionColOpt
})

const getResetBtnOptions = computed((): ButtonOptions => {
	return Object.assign(
		{
			text: FORM_MESSAGES.button.reset
		},
		props.resetButtonOptions
	)
})

const getSubmitBtnOptions = computed((): ButtonOptions => {
	return Object.assign(
		{
			text: FORM_MESSAGES.button.query
		},
		props.submitButtonOptions
	)
})

function toggleAdvanced() {
	emit('toggleAdvanced', props.isAdvanced)
}

const handleSubmit = async (e: Event) => {
	await submit(e).catch(() => {})
}
</script>

<template>
	<Col v-if="showActionButtonGroup" v-bind="actionColOpt">
		<div :style="{ textAlign: actionColOpt.style?.textAlign }" style="width: 100%">
			<Form.Item>
				<slot name="resetBefore" />
				<a-button
					v-if="showResetButton"
					class="mr-2"
					type="default"
					v-bind="getResetBtnOptions"
					@click="resetFields"
				>
					{{ getResetBtnOptions.text }}
				</a-button>
				<slot name="submitBefore" />

				<a-button
					v-if="showSubmitButton"
					class="mr-2"
					type="primary"
					v-bind="getSubmitBtnOptions"
					@click="handleSubmit($event)"
				>
					{{ getSubmitBtnOptions.text }}
				</a-button>

				<slot name="advanceBefore" />
				<a-button v-if="showAdvancedButton && !hideAdvanceBtn" size="small" type="link" @click="toggleAdvanced">
					{{ isAdvanced ? FORM_MESSAGES.button.collapse : FORM_MESSAGES.button.expand }}
					<UpOutlined v-if="isAdvanced" class="ml-1" />
					<DownOutlined v-else class="ml-1" />
				</a-button>
				<slot name="advanceAfter" />
			</Form.Item>
		</div>
	</Col>
</template>
