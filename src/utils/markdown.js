// Simple Markdown Renderer for eDEX Chatbot
class MarkdownRenderer {
    constructor() {
        this.rules = [
            // Code blocks
            {
                pattern: /```(\w*)\n([\s\S]*?)\n```/g,
                replacement: '<pre><code class="language-$1">$2</code></pre>'
            },
            // Inline code
            {
                pattern: /`([^`]+)`/g,
                replacement: '<code>$1</code>'
            },
            // Bold
            {
                pattern: /\*\*(.*?)\*\*/g,
                replacement: '<strong>$1</strong>'
            },
            // Italic
            {
                pattern: /\*(.*?)\*/g,
                replacement: '<em>$1</em>'
            },
            // Links
            {
                pattern: /\[([^\]]+)\]\(([^\)]+)\)/g,
                replacement: '<a href="$2" target="_blank" rel="noopener">$1</a>'
            },
            // Blockquotes
            {
                pattern: /^> (.+)$/gm,
                replacement: '<blockquote>$1</blockquote>'
            },
            // Headers
            {
                pattern: /^### (.*$)/gm,
                replacement: '<h3>$1</h3>'
            },
            {
                pattern: /^## (.*$)/gm,
                replacement: '<h2>$1</h2>'
            },
            {
                pattern: /^# (.*$)/gm,
                replacement: '<h1>$1</h1>'
            },
            // Line breaks
            {
                pattern: /\n/g,
                replacement: '<br>'
            }
        ];
    }

    render(text) {
        let html = text;
        
        // Apply all markdown rules
        this.rules.forEach(rule => {
            html = html.replace(rule.pattern, rule.replacement);
        });
        
        return html;
    }

    // Syntax highlighting for code blocks (basic)
    highlightCode(code, language) {
        const keywords = {
            javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return'],
            python: ['def', 'class', 'if', 'else', 'for', 'while', 'import', 'from', 'return'],
            css: ['color', 'background', 'margin', 'padding', 'border', 'font', 'display'],
            html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'body', 'head', 'html']
        };

        if (keywords[language]) {
            keywords[language].forEach(keyword => {
                const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
                code = code.replace(regex, `<span class="keyword">$1</span>`);
            });
        }

        return code;
    }
}

window.MarkdownRenderer = MarkdownRenderer;