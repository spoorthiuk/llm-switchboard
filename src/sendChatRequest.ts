import * as http from 'http';
export async function sendChatRequest(userMessage: string, selectedModel: string): Promise<string> {
    const apiUrl = 'http://localhost:11434/api/chat';
    const requestBody = JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: userMessage }],
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