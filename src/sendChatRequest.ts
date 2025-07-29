import * as http from 'http';

// Stores the conversation history as an array of message objects
let chatHistory: { role: string; content: string }[] = []; 

/**
 * Sends a chat request to the local LLM API and returns the AI's response.
 * @param userMessage The user's message to send.
 * @param selectedModel The LLM model to use.
 * @returns The AI's formatted response as HTML.
 */
export async function sendChatRequest(userMessage: string, selectedModel: string): Promise<string> {
    const apiUrl = 'http://localhost:11434/api/chat';
    // Add the user's message to the conversation history
    chatHistory.push({ role: 'user', content: userMessage });

    // Prepare the request body with model and full chat history
    const requestBody = JSON.stringify({
        model: selectedModel,
        messages: chatHistory, // Send full conversation history
    });

    return new Promise((resolve, reject) => {
        // Create an HTTP POST request to the LLM API
        const req = http.request(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }, (res) => {
            let data = '';
            // Collect response data chunks
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    // The response may be streamed as newline-separated JSON chunks
                    const responseChunks = data.split('\n');
                    let fullMessage = '';
                    for (const chunk of responseChunks) {
                        try {
                            // Parse each JSON chunk
                            const jsonResponse = JSON.parse(chunk);
                            fullMessage += jsonResponse.message.content; // Accumulate the content
                            if (jsonResponse.done) {
                                // Format the AI response with HTML for code, headers, lists, etc.
                                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                                const header3Regex = /### (.*?)(\n|$)/g;
                                const header4Regex = /#### (.*?)(\n|$)/g;
                                const boldRegex = /\*\*(.*?)\*\*/g;
                                const inlineCodeRegex = /`([^`]+)`/g;
                                const numberedListRegex = /^(\d+)\. (.*?)(\n|$)/gm;
                                const bulletedListRegex = /^\* (.*?)(\n|$)/gm;
                                const dashListRegex = /^- (.*?)(\n|$)/gm;

                                fullMessage =  fullMessage.replace(codeBlockRegex, (match, lang, code) => {
                                    lang = lang || "plaintext"; // Default to plaintext if no language is provided
                                    return `
                                    <div class="code-container">
                                        <div class="code-header">
                                            <span>${lang.toUpperCase()}</span>
                                            <button class="copy-button" onclick="copyCode(this)">Copy</button>
                                        </div>
                                        <pre class="line-numbers"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
                                    </div>`;
                                })
                                .replace(header3Regex, (match, header) => {
                                    return `<h3>${header}</h3>`;
                                })
                                .replace(header4Regex, (match, header) => {
                                    return `<h4>${header}</h4>`;
                                })
                                .replace(boldRegex, (match, boldText) => {
                                    return `<strong>${boldText}</strong>`;
                                })
                                .replace(inlineCodeRegex, (match, code) => {
                                    return `<code>${code}</code>`;
                                })
                                .replace(numberedListRegex, (match) => {
                                    let listItems = "";
                                    let startNumber = 1;
                                    match.replace(numberedListRegex, (m, number, text) => {
                                        if (!listItems) startNumber = Number(number); // Set starting number from the first list item
                                        listItems += `<li>${text}</li>`;
                                        return m;
                                    });
                                    return `<ol start="${startNumber}">${listItems}</ol>`;
                                })
                                .replace(bulletedListRegex, (match, text) => {
                                    return `<ul><li>${text}</li></ul>`;
                                })
                                .replace(dashListRegex, (match, text) => {
                                    return `<ul><li>${text}</li></ul>`;
                                });
                                break; // If the message is done, stop
                            }
                        } catch (err) {
                            // Ignore parse errors for empty lines or incomplete chunks
                            console.error('Error parsing chunk:', err);
                        }
                    }

                    // If a message was constructed, resolve with it
                    if (fullMessage) {
                        resolve(fullMessage.trim());
                    } else {
                        reject('No valid response message.');
                    }
                } catch (err) {
                    // Handle errors in parsing the response
                    console.error('Error parsing response:', err);
                    reject('Error parsing response.');
                }
            });
        });

        // Handle request errors
        req.on('error', (err) => {
            console.error('Request error:', err);  // Log request error
            reject('Error with API request.');
        });

        // Send the request body and end the request
        req.write(requestBody);
        req.end();
    });

    /**
     * Escapes HTML special characters in code blocks to prevent injection.
     * @param unsafe The raw code string.
     * @returns The escaped HTML string.
     */
    function escapeHtml(unsafe: string): string {
        return unsafe.replace(/[&<"']/g, (match) => {
            switch (match) {
                case '&':
                    return '&amp;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '"':
                    return '&quot;';
                case "'":
                    return '&#039;';
                default:
                    return match;
            }
             });
    }
}