export function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Chat</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-darcula.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.css" />
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 10px;
                background-color: rgb(4, 4, 4);
                color: white;
            }
            .chat-container {
                display: flex;
                flex-direction: column;
                height: 98vh;
            }
            .messages {
                flex-grow: 1;
                overflow-y: auto;
                border: 1px solid #ccc;
                background: rgb(23, 23, 23);
            }
            .message {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .message.user {
                justify-content: flex-end;
            }
            .message.ai {
                justify-content: flex-start;
            }
            .message .avatar {
                width: 40px;
                height: 40px;
                border-radius: 10px;
                background-color: #555;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 10px;
            }
            .message .text {
                max-width: 70%;
                padding: 10px;
                border-radius: 10px;
                background-color: #333;
            }
            .message.user .text {
                background-color: #0078d4;
                color: white;
            }
            .input-container {
                display: flex;
                padding-top: 10px;
            }
            input {
                flex-grow: 1;
                padding: 10px;
                border: 1px solid #555;
                border-radius: 5px;
                background-color: #333;
                color: white;
            }
            button {
                padding: 10px;
                border: none;
                border-radius: 5px;
                background-color: #0078d4;
                color: white;
                margin-left: 10px;
                cursor: pointer;
            }
            
            /* Code Block Styling */
            .code-container {
                position: relative;
                background: #1e1e1e;
                border-radius: 5px;
                padding: 10px;
                margin-top: 5px;
                font-family: 'Courier New', Courier, monospace;
                overflow-x: auto;
            }
            .code-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 0.9em;
                color: #ddd; /* Lighter text for better contrast */
                background: rgb(40, 40, 40); /* Darker background for contrast */
                border-top-left-radius: 5px;
                border-top-right-radius: 5px;
                padding: 8px 12px; /* More padding for better spacing */
                font-weight: bold;
            }

            .copy-button {
                background: none;
                border: none;
                color: #bbb;
                cursor: pointer;
                font-size: 0.8em;
            }
            .copy-button:hover {
                color: white;
            }
            pre {
                margin: 0;
            }
            .typing-indicator {
                display: none;
                font-style: italic;
                color: #bbb;
            }
        </style>
    </head>
    <body data-prismjs-copy-timeout="500">
        <div class="chat-container">
            <div class="messages" id="messages"></div>
            <div class="typing-indicator" id="typingIndicator">AI is typing<span id="dots">...</span></div>
            <div class="input-container">
                <input type="text" id="userInput" placeholder="Type your message here...">
                <button id="sendButton">Send</button>
            </div>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            const inputBox = document.getElementById('userInput');
            const sendButton = document.getElementById('sendButton');
            const messagesContainer = document.getElementById('messages');
            const typingIndicator = document.getElementById('typingIndicator');
            const dots = document.getElementById('dots');

            function addMessage(text, sender) {
                const messageElement = document.createElement('div');
                messageElement.classList.add('message', sender);
                messageElement.innerHTML = sender === 'user' ? \`
                    <div class="text">\${text}</div>
                    <div class="avatar">👤</div>
                \` : \`
                    <div class="avatar">🤖</div>
                    <div class="text">\${text}</div>
                \`;
                messagesContainer.appendChild(messageElement);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                Prism.highlightAll();
            }

            function copyCode(button) {
                const codeBlock = button.parentElement.nextElementSibling.querySelector("code");
                navigator.clipboard.writeText(codeBlock.innerText).then(() => {
                    button.textContent = "Copied!";
                    setTimeout(() => button.textContent = "Copy", 2000);
                });
            }

            sendButton.addEventListener('click', () => {
                const userMessage = inputBox.value;
                if (userMessage.trim()) {
                    addMessage(userMessage, 'user');
                    vscode.postMessage({
                        command: 'sendMessage',
                        text: userMessage
                    });
                    inputBox.value = '';
                    showTypingIndicator();
                }
            });

            inputBox.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    sendButton.click();
                }
            });

            window.addEventListener('message', event => {
                const message = event.data;
                switch (message.command) {
                    case 'receiveMessage':
                        hideTypingIndicator();
                        addMessage(message.text, 'ai');
                        break;
                }
            });

            let typingInterval;

            function showTypingIndicator() {
                typingIndicator.style.display = 'block';
                let dotCount = 0;
                typingInterval = setInterval(() => {
                    dots.textContent = '.'.repeat((dotCount % 3) + 1);
                    dotCount++;
                }, 500);
            }

            function hideTypingIndicator() {
                clearInterval(typingInterval);
                typingIndicator.style.display = 'none';
            }
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/prism.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-python.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-javascript.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-typescript.min.js"></script>
        <script>Prism.highlightAll();</script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
    </body>
    </html>
    `;
}