import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { sendChatRequest } from './sendChatRequest';
import { exec } from 'child_process';

async function fetchInstalledModels(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        exec('ollama list', (error, stdout) => {
            if (error) {
                vscode.window.showErrorMessage("Failed to fetch Ollama models. Is Ollama installed?");
                return reject(error);
            }
            const models = stdout
                .split('\n')
                .slice(1)
                .map(line => line.split(/\s+/)[0])
                .filter(name => name);
            resolve(models);
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('llm-switchboard.switchboard', async () => {
        vscode.window.showInformationMessage('Choose an AI assistant');
        console.log('Switchboard activated');
        const modelSelection = vscode.window.createQuickPick();
        const models = await fetchInstalledModels();

        modelSelection.items = models.map((model: string) => ({
            label: model
        }));
        modelSelection.onDidChangeSelection(selection => {
			const selectedModel = selection[0].label;
            if (selection[0]) {
                vscode.window.showInformationMessage(`You selected: ${selectedModel}`);
                modelSelection.hide();
                const panel = vscode.window.createWebviewPanel(
                    'llmChat',
                    `${selectedModel}`,
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    }
                );

                // HTML content for the chat window
                panel.webview.html = getWebviewContent();

                // Listen for messages from the webview
                panel.webview.onDidReceiveMessage(async (message) => {
                    if (message.command === 'sendMessage') {
                        const userMessage = message.text;
                        const response = await sendChatRequest(userMessage, selectedModel);  // Call API with the user message
                        panel.webview.postMessage({ command: 'receiveMessage', text: response });  // Send response back to webview
                    }
                });
            }
        });

        modelSelection.onDidHide(() => modelSelection.dispose());
        modelSelection.show();
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}


