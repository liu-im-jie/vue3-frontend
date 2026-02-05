<script lang="ts">
import type { CSSProperties, PropType } from 'vue'
import { InfoCircleOutlined } from '@ant-design/icons-vue'
import { Tooltip } from 'ant-design-vue'
import { computed, defineComponent, h, unref } from 'vue'
import { getSlot } from '@/utils/tsxHelper'
import { isArray, isString } from '@/utils/is'

const props = {
	/**
	 * Help text max-width
	 * @default: 600px
	 */
	maxWidth: { type: String, default: '600px' },
	/**
	 * Whether to display the serial number
	 * @default: false
	 */
	showIndex: { type: Boolean },
	/**
	 * Help text font color
	 * @default: #ffffff
	 */
	color: { type: String, default: '#ffffff' },
	/**
	 * Help text font size
	 * @default: 14px
	 */
	fontSize: { type: String, default: '14px' },
	/**
	 * Help text list
	 */
	placement: { type: String, default: 'right' },
	/**
	 * Help text list
	 */
	text: { type: [Array, String] as PropType<string[] | string> }
}

export default defineComponent({
	name: 'BasicHelp',
	components: { Tooltip },
	props,
	setup(props, { slots }) {
		const getTooltipStyle = computed((): CSSProperties => ({ color: props.color, fontSize: props.fontSize }))

		const getOverlayStyle = computed((): CSSProperties => ({ maxWidth: props.maxWidth }))

		function renderTitle() {
			const textList = props.text

			if (isString(textList)) {
				return h('p', null, textList)
			}

			if (isArray(textList)) {
				return textList.map((text, index) => {
					return h('p', { key: text }, [props.showIndex ? `${index + 1}. ` : '', text])
				})
			}
			return undefined
		}

		return () => {
			return h(
				Tooltip,
				{
					overlayClassName: 'basic-help__wrap',
					title: h('div', { style: unref(getTooltipStyle) }, renderTitle()),
					autoAdjustOverflow: true,
					overlayStyle: unref(getOverlayStyle),
					placement: props.placement as 'right'
				},
				{
					default: () => h('span', { class: 'basic-help' }, getSlot(slots) || h(InfoCircleOutlined))
				}
			)
		}
	}
})
</script>

<style lang="less">
.basic-help__wrap p {
	margin-bottom: 0;
}
</style>
