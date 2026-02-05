import type { Slots } from 'vue'
import { isFunction } from '@/utils/is'

/**
 * 获取插槽内容，防止空插槽报错
 * @param slots 插槽对象
 * @param slot 插槽名称
 * @param data 传递给插槽的数据
 */
export function getSlot(slots: Slots, slot = 'default', data?: unknown) {
	if (!slots || !Reflect.has(slots, slot)) {
		return null
	}
	if (!isFunction(slots[slot])) {
		console.error(`${slot} is not a function!`)
		return null
	}
	const slotFn = slots[slot]
	if (!slotFn) {
		return null
	}
	return slotFn(data)
}

/**
 * 扩展插槽
 * @param slots 插槽对象
 * @param excludeKeys 排除的插槽名称
 */
export function extendSlots(slots: Slots, excludeKeys: string[] = []) {
	const slotKeys = Object.keys(slots)
	const ret: Record<string, () => unknown> = {}
	slotKeys.forEach((key) => {
		if (!excludeKeys.includes(key)) {
			ret[key] = () => getSlot(slots, key)
		}
	})
	return ret
}
