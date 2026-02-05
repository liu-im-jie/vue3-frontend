import type { Component, VNodeProps } from 'vue'
/**
 * Component list, register here to setting it in the form
 */
import {
	AutoComplete,
	Cascader,
	Checkbox,
	DatePicker,
	Divider,
	Input,
	InputNumber,
	Radio,
	Rate,
	Select,
	Slider,
	Switch,
	TimePicker,
	Tree,
	TreeSelect,
	Upload
} from 'ant-design-vue'

const componentMap = {
	Input,
	InputGroup: Input.Group,
	InputPassword: Input.Password,
	InputSearch: Input.Search,
	InputTextArea: Input.TextArea,
	InputNumber,
	AutoComplete,
	Select,
	TreeSelect,
	Tree,
	Switch,
	RadioGroup: Radio.Group,
	Checkbox,
	CheckboxGroup: Checkbox.Group,
	Cascader,
	Slider,
	Rate,
	DatePicker,
	MonthPicker: DatePicker.MonthPicker,
	RangePicker: DatePicker.RangePicker,
	WeekPicker: DatePicker.WeekPicker,
	TimePicker,
	Upload,

	Divider
}

type ExtractPropTypes<T extends Component> = T extends new (...args: unknown[]) => infer R
	? R extends { $props: infer P }
		? Writable<Omit<P, keyof VNodeProps>>
		: never
	: never

type ComponentMapType = typeof componentMap

export type ComponentType = keyof ComponentMapType

export type ComponentMapProps = {
	[K in ComponentType]: ExtractPropTypes<ComponentMapType[K]>
}

export type AllComponentProps = ComponentMapProps[ComponentType]

export { componentMap }
