<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import {
	CommentOutlined,
	CloseOutlined,
	SendOutlined,
	UserOutlined,
	RobotOutlined,
	ClearOutlined,
	BookOutlined
} from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { sendChatMessageStream, type ChatMessage } from '@/api/deepseek'
import { renderMarkdown } from '@/utils/markdown'
import 'github-markdown-css/github-markdown.css'

const visible = ref(false)
// 等待指示器，loading为请求结果，thinking为开始流式传输
const loading = ref(false)
const thinking = ref(false)
const inputMessage = ref('')
const messages = ref<ChatMessage[]>([{ role: 'assistant', content: '您好！我是您的智能助手，有什么可以帮您？' }])
const messagesContainer = ref<HTMLElement | null>(null)

const useKnowledgeBase = ref(false)
const knowledgeContent = ref('')

const loadKnowledgeBase = async () => {
	try {
		const files = import.meta.glob('@/assets/knowledge/*.md', { query: '?raw', import: 'default' })
		let content = ''
		for (const path in files) {
			const loader = files[path]
			if (loader) {
				const fileContent = (await loader()) as string
				content += `\n\n--- File: ${path.split('/').pop()} ---\n${fileContent}`
			}
		}
		if (content.length > 50000) {
			console.warn('Knowledge base is large (' + content.length + ' chars). Truncating to 50000 chars.')
			content = content.substring(0, 50000) + '\n...(truncated)...'
		}
		knowledgeContent.value = content
		console.log('Knowledge base loaded:', content.length, 'chars')
	} catch (e) {
		console.error('Failed to load knowledge base:', e)
		message.error('知识库加载失败')
	}
}

watch(useKnowledgeBase, (newVal) => {
	if (newVal && !knowledgeContent.value) {
		loadKnowledgeBase()
	}
})

const toggleChat = () => {
	visible.value = !visible.value
	if (visible.value) {
		scrollToBottom()
	}
}

const scrollToBottom = async () => {
	await nextTick()
	if (messagesContainer.value) {
		messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
	}
}

const handleSend = async () => {
	const content = inputMessage.value.trim()
	if (!content) return
	if (loading.value) return

	messages.value.push({ role: 'user', content })
	inputMessage.value = ''
	scrollToBottom()

	loading.value = true
	thinking.value = true

	try {
		let contextMessages = [...messages.value.slice(-10)]

		if (useKnowledgeBase.value && knowledgeContent.value) {
			const systemMessage: ChatMessage = {
				role: 'system',
				content: `以下是项目相关的本地文档资料，请优先基于这些资料回答用户的问题（不要在回答里提及这些资料，例如不要说：根据您提供的XXX文档等内容）：\n${knowledgeContent.value}`
			}
			contextMessages = [systemMessage, ...contextMessages]
		}

		await sendChatMessageStream(
			contextMessages,
			(chunk) => {
				if (thinking.value) {
					thinking.value = false
					messages.value.push({ role: 'assistant', content: '' })
				}

				const lastMsg = messages.value[messages.value.length - 1]
				if (lastMsg) {
					lastMsg.content += chunk
					scrollToBottom()
				}
			},
			() => {
				loading.value = false
				thinking.value = false
			},
			(error) => {
				console.error(error)
				message.error('发送失败，请稍后重试')
				loading.value = false
				thinking.value = false
			}
		)
	} catch (error) {
		message.error('发送失败，请稍后重试')
		console.error(error)
		loading.value = false
		thinking.value = false
	}
}

const handleClear = () => {
	messages.value = [{ role: 'assistant', content: '已清空上下文。您好！我是您的智能助手，有什么可以帮您？' }]
}

watch(() => messages.value.length, scrollToBottom)
</script>

<template>
	<div class="fixed bottom-8 right-8 z-50">
		<a-float-button type="primary" :style="{ right: '24px', bottom: '24px' }" @click="toggleChat">
			<template #icon>
				<CommentOutlined />
			</template>
		</a-float-button>

		<transition name="fade-slide">
			<div
				v-if="visible"
				class="absolute bottom-16 right-0 h-[500px] w-[380px] flex flex-col overflow-hidden border border-gray-100 rounded-lg bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
			>
				<!-- Header -->
				<div class="flex items-center justify-between bg-blue-600 px-4 py-3 text-white dark:bg-blue-900">
					<div class="flex items-center gap-2">
						<RobotOutlined />
						<span class="font-medium">智能客服</span>
					</div>
					<div class="flex items-center gap-2">
						<a-tooltip :title="useKnowledgeBase ? '关闭项目知识库' : '开启项目知识库'">
							<BookOutlined
								class="cursor-pointer transition-colors"
								:class="useKnowledgeBase ? 'text-yellow-300' : 'hover:text-gray-200'"
								@click="useKnowledgeBase = !useKnowledgeBase"
							/>
						</a-tooltip>
						<a-tooltip title="清空对话">
							<ClearOutlined class="cursor-pointer hover:text-gray-200" @click="handleClear" />
						</a-tooltip>
						<CloseOutlined class="cursor-pointer hover:text-gray-200" @click="visible = false" />
					</div>
				</div>

				<!-- Messages Area -->
				<div ref="messagesContainer" class="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 dark:bg-gray-900">
					<div
						v-for="(msg, index) in messages"
						:key="index"
						class="flex gap-3"
						:class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
					>
						<!-- Avatar -->
						<div
							class="h-8 w-8 flex shrink-0 items-center justify-center rounded-full"
							:class="msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'"
						>
							<UserOutlined v-if="msg.role === 'user'" />
							<RobotOutlined v-else />
						</div>

						<!-- Content -->
						<div
							class="max-w-[80%] break-words rounded-lg px-3 py-2 text-sm leading-relaxed"
							:class="[
								msg.role === 'user'
									? 'bg-blue-600 text-white rounded-tr-none'
									: 'bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-tl-none'
							]"
						>
							<div v-if="msg.role === 'user'">{{ msg.content }}</div>
							<!-- eslint-disable-next-line vue/no-v-html -->
							<div v-else class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
						</div>
					</div>

					<!-- Loading Indicator -->
					<div v-if="thinking" class="flex gap-3">
						<div
							class="h-8 w-8 flex shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600"
						>
							<RobotOutlined />
						</div>
						<div
							class="flex items-center gap-1 border border-gray-200 rounded-lg rounded-tl-none bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
						>
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 0ms"
							></span>
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 150ms"
							></span>
							<span
								class="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
								style="animation-delay: 300ms"
							></span>
						</div>
					</div>
				</div>

				<!-- Input Area -->
				<div class="border-t border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
					<div class="relative">
						<a-textarea
							v-model:value="inputMessage"
							placeholder="请输入您的问题..."
							:auto-size="{ minRows: 1, maxRows: 4 }"
							class="pr-10"
							@press-enter.prevent="handleSend"
						/>
						<div
							class="absolute bottom-2 right-2 cursor-pointer text-blue-600 transition-colors hover:text-blue-700"
							:class="{ 'opacity-50 cursor-not-allowed': loading || !inputMessage.trim() }"
							@click="handleSend"
						>
							<SendOutlined />
						</div>
					</div>
					<div class="mt-2 text-center text-xs text-gray-400">内容由 AI 生成，仅供参考</div>
				</div>
			</div>
		</transition>
	</div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
	transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
	opacity: 0;
	transform: translateY(20px) scale(0.95);
}

.markdown-body {
	box-sizing: border-box;
	min-width: 0;
	background-color: transparent !important;
	font-size: 0.875rem !important;
	font-family: inherit !important;
	line-height: 1.6 !important;
	color: #24292f;
}

.dark .markdown-body {
	color: #e6edf3;
}

.markdown-body {
	padding: 0 !important;
}

.markdown-body p {
	margin-bottom: 0.5em !important;
}
.markdown-body p:last-child {
	margin-bottom: 0 !important;
}
</style>
