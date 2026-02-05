<script lang="ts" setup>
import type { PropType } from 'vue'
import { LoadingOutlined } from '@ant-design/icons-vue'
import { Select } from 'ant-design-vue'
import { selectProps } from 'ant-design-vue/es/select'
import { get, omit } from 'lodash-es'
import { computed, ref, unref, watch, watchEffect } from 'vue'
import { isFunction } from '@/utils/is'
import { propTypes } from '@/utils/propTypes'
import { FORM_MESSAGES } from '../constants'

interface OptionsItem {
	label: string
	value: string | number
	disabled?: boolean
}

defineOptions({
	name: 'ApiSelect',
	inheritAttrs: false
})

const props = defineProps({
	...selectProps(),
	value: {
		type: [Array, Object, String, Number] as PropType<unknown>,
		default: undefined
	},
	numberToString: propTypes.bool,
	api: {
		type: Function as PropType<(arg?: Recordable) => Promise<unknown>>,
		default: null
	},
	// api params
	params: {
		type: Object as PropType<Recordable>,
		default: () => ({})
	},
	// support xxx.xxx.xx
	resultField: propTypes.string.def(''),
	labelField: propTypes.string.def('label'),
	valueField: propTypes.string.def('value'),
	immediate: propTypes.bool.def(true),
	alwaysLoad: propTypes.bool.def(false)
})

const emit = defineEmits(['optionsChange', 'change'])

const options = ref<OptionsItem[]>([])
const loading = ref(false)
const isFirstLoad = ref(true)
const emitData = ref<unknown[]>([])

const getProps = computed(() => props as unknown as Recordable)

// Embedded in the form, just use the hook binding to perform form verification

const getOptions = computed(() => {
	const { labelField = 'label', valueField = 'value', numberToString } = props

	return unref(options).reduce((prev, next) => {
		if (next) {
			const nextRecord = next as unknown as Recordable
			const value = nextRecord[valueField]
			prev.push({
				...omit(nextRecord, [labelField, valueField]),
				label: nextRecord[labelField] as string,
				value: numberToString ? `${value}` : value
			})
		}
		return prev
	}, [] as OptionsItem[])
})

watchEffect(() => {
	props.immediate && !props.alwaysLoad && fetch()
})

watch(
	() => props.params,
	() => {
		!unref(isFirstLoad) && fetch()
	},
	{ deep: true }
)

async function fetch() {
	const api = props.api
	if (!api || !isFunction(api)) {
		return
	}
	options.value = []
	try {
		loading.value = true
		const res = await api(props.params)
		if (Array.isArray(res)) {
			options.value = res as OptionsItem[]
			emitChange()
			return
		}
		if (props.resultField) {
			options.value = (get(res as object, props.resultField) as OptionsItem[]) || []
		}
		emitChange()
	} catch (error) {
		console.warn(error)
	} finally {
		loading.value = false
	}
}

async function handleFetch(visible: boolean) {
	if (visible) {
		if (props.alwaysLoad) {
			await fetch()
		} else if (!props.immediate && unref(isFirstLoad)) {
			await fetch()
			isFirstLoad.value = false
		}
	}
}

function emitChange() {
	emit('optionsChange', unref(getOptions))
}

function handleChange(_value: unknown, ...args: unknown[]) {
	emitData.value = args
}
</script>

<template>
	<Select :options="getOptions" v-bind="getProps" @change="handleChange" @dropdown-visible-change="handleFetch">
		<template v-for="item in Object.keys($slots)" #[item]="data">
			<slot :name="item" v-bind="data || {}" />
		</template>
		<template v-if="loading" #suffixIcon>
			<LoadingOutlined spin />
		</template>
		<template v-if="loading" #notFoundContent>
			<span>
				<LoadingOutlined class="mr-1" spin />
				{{ FORM_MESSAGES.loading }}
			</span>
		</template>
	</Select>
</template>
