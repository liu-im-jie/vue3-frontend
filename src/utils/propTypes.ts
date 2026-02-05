import type { PropType } from 'vue'

// Helper to create the prop definition with chainable methods
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface PropOptions<T = any> {
	type?: PropType<T> | true | null
	required?: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	default?: any
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	validator?: (value: any) => boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[key: string]: any
}

export interface VueProp<T> extends PropOptions<T> {
	def: (val: unknown) => VueProp<T>
	isRequired: VueProp<T>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createProp = <T>(type: any): VueProp<T> => {
	const prop = {
		type
	} as VueProp<T>

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const setProp = (key: string, val: any) => {
		const newProp = { ...prop, [key]: val } as VueProp<T>
		/** Re-attach methods to the new object */
		newProp.def = (val: unknown) => setProp('default', val)
		Object.defineProperty(newProp, 'isRequired', {
			get() {
				return setProp('required', true)
			}
		})
		return newProp
	}

	prop.def = (val: unknown) => setProp('default', val)

	Object.defineProperty(prop, 'isRequired', {
		get() {
			return setProp('required', true)
		}
	})

	return prop
}

export const propTypes = {
	string: createProp<string>(String),
	number: createProp<number>(Number),
	bool: createProp<boolean>(Boolean),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	array: createProp<any[]>(Array),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	object: createProp<Record<string, any>>(Object),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	func: createProp<(...args: any[]) => any>(Function),
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any: createProp<any>(undefined)
}

export default propTypes
