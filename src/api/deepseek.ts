import axios from 'axios'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY
const API_URL = 'https://api.deepseek.com/chat/completions'

const deepseekApi = axios.create({
	baseURL: API_URL,
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${API_KEY}`
	}
})

export interface ChatMessage {
	role: 'system' | 'user' | 'assistant'
	content: string
}

export const sendChatMessageStream = async (
	messages: ChatMessage[],
	onChunk: (text: string) => void,
	onDone?: () => void,
	onError?: (err: unknown) => void
) => {
	if (!API_KEY) {
		throw new Error('DeepSeek API Key is missing. Please check your .env configuration.')
	}

	try {
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${API_KEY}`
			},
			body: JSON.stringify({
				model: 'deepseek-chat',
				messages,
				stream: true
			})
		})

		if (!response.ok) {
			const error = await response.json().catch(() => ({}))
			throw new Error(error.error?.message || `HTTP error! status: ${response.status}`)
		}

		if (!response.body) {
			throw new Error('Response body is null')
		}

		const reader = response.body.getReader()
		const decoder = new TextDecoder('utf-8')
		let buffer = ''

		while (true) {
			const { done, value } = await reader.read()
			if (done) break

			buffer += decoder.decode(value, { stream: true })
			const lines = buffer.split('\n')
			buffer = lines.pop() || ''

			for (const line of lines) {
				const trimmedLine = line.trim()
				if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

				const data = trimmedLine.slice(6)
				if (data === '[DONE]') {
					onDone?.()
					return
				}

				try {
					const json = JSON.parse(data)
					const content = json.choices[0]?.delta?.content || ''
					if (content) {
						onChunk(content)
					}
				} catch (e) {
					console.error('Error parsing stream data:', e)
				}
			}
		}
	} catch (error) {
		console.error('DeepSeek Stream API Error:', error)
		onError?.(error)
	}
}

export const sendChatMessage = async (messages: ChatMessage[]) => {
	if (!API_KEY) {
		throw new Error('DeepSeek API Key is missing. Please check your .env configuration.')
	}

	try {
		const response = await deepseekApi.post('', {
			model: 'deepseek-chat',
			messages,
			stream: false
		})
		return response.data
	} catch (error) {
		console.error('DeepSeek API Error:', error)
		throw error
	}
}
