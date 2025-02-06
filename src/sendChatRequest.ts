import * as http from 'http';

let chatHistory: { role: string; content: string }[] = []; 

export async function sendChatRequest(userMessage: string, selectedModel: string): Promise<string> {
    const apiUrl = 'http://localhost:11434/api/chat';
    chatHistory.push({ role: 'user', content: userMessage });

    const requestBody = JSON.stringify({
        model: selectedModel,
        messages: chatHistory, // Send full conversation history
    });

    return new Promise((resolve, reject) => {
        const req = http.request(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }, (res) => {
            let data = '';
            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    // Attempt to parse the full response
                    const responseChunks = data.split('\n');
                    let fullMessage = '';
                    for (const chunk of responseChunks) {
                        try {
                            const jsonResponse = JSON.parse(chunk);
                            fullMessage += jsonResponse.message.content; // Accumulate the content
                            if (jsonResponse.done) {
                                const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
                                const headerRegex = /### (.*?)(\n|$)/g;
                                const boldRegex = /\*\*(.*?)\*\*/g;
                                const inlineCodeRegex = /`([^`]+)`/g;
                                const numberedListRegex = /^(\d+)\. (.*?)(\n|$)/gm;
                                const bulletedListRegex = /^\* (.*?)(\n|$)/gm;
                                console.log(fullMessage);

                                fullMessage =  fullMessage.replace(codeBlockRegex, (match, lang, code) => {
                                    lang = lang || "plaintext"; // Default to plaintext if no language is provided
                                    return `
                                    <div class="code-container">
                                        <div class="code-header">
                                            <span>${lang.toUpperCase()}</span>
                                            <button class="copy-button" onclick="copyCode(this)">Copy</button>
                                        </div>
                                        <pre class="line-numbers"><code class="language-${lang}">${code}</code></pre>
                                    </div>`;
                                })
                                .replace(headerRegex, (match, header) => {
                                    return `<h3>${header}</h3>`;
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
                                });
                                break; // If the message is done, stop
                            }
                        } catch (err) {
                            console.error('Error parsing chunk:', err);
                        }
                    }

                    // If no message was successfully constructed
                    if (fullMessage) {
                        resolve(fullMessage.trim());
                    } else {
                        reject('No valid response message.');
                    }
                } catch (err) {
                    console.error('Error parsing response:', err);
                    reject('Error parsing response.');
                }
            });
        });

        req.on('error', (err) => {
            console.error('Request error:', err);  // Log request error
            reject('Error with API request.');
        });

        req.write(requestBody);
        req.end();
    });
}