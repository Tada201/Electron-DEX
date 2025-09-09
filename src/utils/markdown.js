// Simple Markdown Renderer for eDEX Chatbot
// Note: For syntax highlighting, load Prism.js globally via CDN in ui.html (e.g., <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script> and additional components).
// If Prism is not available, code blocks are rendered without highlighting.

class MarkdownRenderer {
    constructor() {
        this.rules = [
            // Code blocks with language
            {
                pattern: /```(\w*)\n([\s\S]*?)\n```/g,
                replacement: (match, language, code) => {
                    // Trim the code
                    const trimmedCode = code.trim();
                    
                    // Highlight code with Prism.js if available and language is supported
                    let highlightedCode = this.escapeHtml(trimmedCode);
                    if (typeof Prism !== 'undefined' && language && Prism.languages[language]) {
                        try {
                            highlightedCode = Prism.highlight(trimmedCode, Prism.languages[language], language);
                        } catch (e) {
                            console.warn('Prism highlighting failed for language:', language, e);
                        }
                    }
                    
                    // Generate unique ID for the code block
                    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
                    
                    return `<pre class="code-block language-${language || 'none'}" data-code-id="${codeId}" data-language="${language || 'none'}"><code class="language-${language || 'none'}">${highlightedCode}</code><div class="code-actions"><button class="copy-button" onclick="copyCodeToClipboard(this)">Copy</button><button class="download-button" onclick="downloadCode(this)">Download</button></div></pre>`;
                }
            },
            // Code blocks without language
            {
                pattern: /```\n([\s\S]*?)\n```/g,
                replacement: (match, code) => {
                    // Trim the code
                    const trimmedCode = code.trim();
                    // Escape HTML in code
                    const escapedCode = this.escapeHtml(trimmedCode);
                    
                    // Generate unique ID for the code block
                    const codeId = 'code-' + Math.random().toString(36).substr(2, 9);
                    
                    return `<pre class="code-block" data-code-id="${codeId}" data-language="none"><code>${escapedCode}</code><div class="code-actions"><button class="copy-button" onclick="copyCodeToClipboard(this)">Copy</button><button class="download-button" onclick="downloadCode(this)">Download</button></div></pre>`;
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
}

// Function to copy code to clipboard
function copyCodeToClipboard(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');
    const codeText = codeElement.textContent;
    
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

// Function to download code as file
function downloadCode(button) {
    const codeBlock = button.closest('.code-block');
    const codeElement = codeBlock.querySelector('code');
    const codeText = codeElement.textContent;
    const language = codeBlock.dataset.language || 'none';
    
    // Determine file extension based on language
    const extensions = {
        'javascript': 'js',
        'python': 'py',
        'css': 'css',
        'html': 'html',
        'java': 'java',
        'json': 'json',
        'bash': 'sh',
        'sql': 'sql',
        'typescript': 'ts',
        'none': 'txt'
    };
    
    const extension = extensions[language] || language || 'txt';
    const filename = `code-${Date.now()}.${extension}`;
    
    // Create blob and download
    const blob = new Blob([codeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
    
    // Show feedback
    const originalText = button.textContent;
    button.textContent = 'Downloaded!';
    setTimeout(() => {
        button.textContent = originalText;
    }, 2000);
}

// Add CSS for syntax highlighting
const syntaxHighlightingCSS = `
    .code-block {
        position: relative;
        background: rgba(var(--color_black), 0.8);
        border: 0.05vh solid rgba(var(--color_r), var(--color_g), var(--color_b), 0.3);
        border-radius: 0.3vh;
        padding: 1vh;
        margin: 0.5vh 0;
        overflow-x: auto;
        font-family: var(--font_mono), monospace;
    }
    
    .code-block .code-actions {
        position: absolute;
        top: 0.5vh;
        right: 0.5vh;
        display: flex;
        gap: 0.3vh;
    }
    
    .code-block .copy-button,
    .code-block .download-button {
        background: rgba(var(--color_r), var(--color_g), var(--color_b), 0.2);
        border: 0.05vh solid rgba(var(--color_r), var(--color_g), var(--color_b), 0.4);
        color: rgba(var(--color_r), var(--color_g), var(--color_b), 0.9);
        border-radius: 0.2vh;
        padding: 0.3vh 0.5vh;
        font-size: 0.9vh;
        cursor: pointer;
        font-family: var(--font_mono), monospace;
        transition: all 0.2s ease;
    }
    
    .code-block .copy-button:hover,
    .code-block .download-button:hover {
        background: rgba(var(--color_r), var(--color_g), var(--color_b), 0.3);
        border-color: rgba(var(--color_r), var(--color_g), var(--color_b), 0.6);
    }
    
    .code-block .copy-button:active,
    .code-block .download-button:active {
        background: rgba(var(--color_r), var(--color_g), var(--color_b), 0.4);
    }
    
    /* Prism.js theme - cyberpunk style */
    pre[class*="language-"] {
        color: #f8f8f2;
        background: none;
        text-shadow: 0 1px rgba(0, 0, 0, 0.3);
        font-family: var(--font_mono), monospace;
        text-align: left;
        white-space: pre;
        word-spacing: normal;
        word-break: normal;
        word-wrap: normal;
        line-height: 1.5;
        -moz-tab-size: 4;
        -o-tab-size: 4;
        tab-size: 4;
        -webkit-hyphens: none;
        -moz-hyphens: none;
        -ms-hyphens: none;
        hyphens: none;
    }

    /* Code blocks */
    pre[class*="language-"] {
        padding: 1em;
        margin: .5em 0;
        overflow: auto;
        border-radius: 0.3em;
    }

    :not(pre) > code[class*="language-"],
    pre[class*="language-"] {
        background: rgba(0, 0, 0, 0.7);
    }

    /* Inline code */
    :not(pre) > code[class*="language-"] {
        padding: .1em;
        border-radius: .3em;
        white-space: normal;
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
        color: #6272a4;
    }

    .token.punctuation {
        color: #f8f8f2;
    }

    .namespace {
        opacity: .7;
    }

    .token.property,
    .token.tag,
    .token.constant,
    .token.symbol,
    .token.deleted {
        color: #ff79c6;
    }

    .token.boolean,
    .token.number {
        color: #bd93f9;
    }

    .token.selector,
    .token.attr-name,
    .token.string,
    .token.char,
    .token.builtin,
    .token.inserted {
        color: #50fa7b;
    }

    .token.operator,
    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string,
    .token.variable {
        color: #f8f8f2;
    }

    .token.atrule,
    .token.attr-value,
    .token.function,
    .token.class-name {
        color: #f1fa8c;
    }

    .token.keyword {
        color: #8be9fd;
    }

    .token.regex,
    .token.important {
        color: #ffb86c;
    }

    .token.important,
    .token.bold {
        font-weight: bold;
    }

    .token.italic {
        font-style: italic;
    }

    .token.entity {
        cursor: help;
    }
`;

// Add the CSS to the document
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = syntaxHighlightingCSS;
    document.head.appendChild(style);
}

window.MarkdownRenderer = MarkdownRenderer;