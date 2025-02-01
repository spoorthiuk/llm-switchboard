export function getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LLM Chat</title>
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
                height: 100vh;
            }
            .messages {
                flex-grow: 1;
                overflow-y: auto;
                border: 1px solid #ccc;
                padding: 10px;
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
        </style>
    </head>
    <body>
        <div class="chat-container">
            <div class="messages" id="messages"></div>
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
                        addMessage(message.text, 'ai');
                        break;
                }
            });
        </script>
    </body>
    </html>
    `;
}