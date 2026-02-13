import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
	html: true, // Enable HTML tags in source
	linkify: true, // Autoconvert URL-like text to links
	typographer: true, // Enable some language-neutral replacement + quotes beautification
	breaks: true // Convert '\n' in paragraphs into <br>
})

export const renderMarkdown = (text: string): string => {
	if (!text) return ''
	return md.render(text)
}
