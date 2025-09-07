// Simple Markdown Renderer for eDEX Chatbot
class MarkdownRenderer {
    constructor() {
        this.rules = [
            // Code blocks with language
            {
                pattern: /```(\w*)\n([\s\S]*?)\n```/g,
                replacement: (match, language, code) => {
                    // Escape HTML in code
                    const escapedCode = this.escapeHtml(code);
                    return `<pre><code class="language-${language}">${escapedCode}</code><button class="copy-button" onclick="copyCodeToClipboard(this)">Copy</button></pre>`;
                }
            },
            // Code blocks without language
            {
                pattern: /```\n([\s\S]*?)\n```/g,
                replacement: (match, code) => {
                    // Escape HTML in code
                    const escapedCode = this.escapeHtml(code);
                    return `<pre><code>${escapedCode}</code><button class="copy-button" onclick="copyCodeToClipboard(this)">Copy</button></pre>`;
                }
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
            // Unordered lists
            {
                pattern: /^\s*-\s+(.+)$/gm,
                replacement: '<li>$1</li>'
            },
            // Wrap consecutive list items
            {
                pattern: /(<li>.*<\/li>\s*)+/g,
                replacement: '<ul>$&</ul>'
            },
            // Ordered lists
            {
                pattern: /^\s*\d+\.\s+(.+)$/gm,
                replacement: '<li>$1</li>'
            },
            // Wrap consecutive ordered list items
            {
                pattern: /(<li>.*<\/li>\s*)+/g,
                replacement: '<ol>$&</ol>'
            },
            // Line breaks
            {
                pattern: /\n/g,
                replacement: '<br>'
            }
        ];
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
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
            javascript: ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'default'],
            python: ['def', 'class', 'if', 'else', 'for', 'while', 'import', 'from', 'return', 'with', 'as', 'try', 'except'],
            css: ['color', 'background', 'margin', 'padding', 'border', 'font', 'display', 'flex', 'grid', 'position'],
            html: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'body', 'head', 'html', 'script', 'link', 'meta'],
            java: ['public', 'private', 'class', 'interface', 'static', 'void', 'int', 'String', 'if', 'else', 'for', 'while'],
            cpp: ['int', 'char', 'void', 'class', 'public', 'private', 'if', 'else', 'for', 'while', 'return'],
            ruby: ['def', 'class', 'if', 'else', 'for', 'while', 'end', 'require', 'module'],
            php: ['function', 'class', 'if', 'else', 'for', 'while', 'echo', 'return', 'namespace'],
            go: ['func', 'package', 'import', 'type', 'struct', 'interface', 'if', 'else', 'for', 'range'],
            rust: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'if', 'else', 'for', 'while'],
            swift: ['func', 'class', 'struct', 'let', 'var', 'if', 'else', 'for', 'while', 'return']
        };

        if (keywords[language]) {
            // Create a regex that matches whole words only
            const keywordRegex = new RegExp('\\b(' + keywords[language].join('|') + ')\\b', 'g');
            code = code.replace(keywordRegex, `<span class="keyword">$1</span>`);
        }

        return code;
    }
}

// Function to copy code to clipboard
function copyCodeToClipboard(button) {
    const codeBlock = button.previousElementSibling;
    const codeText = codeBlock.textContent;
    
    navigator.clipboard.writeText(codeText).then(() => {
        // Show feedback
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy code: ', err);
        button.textContent = 'Failed!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

window.MarkdownRenderer = MarkdownRenderer;