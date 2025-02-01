import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { sendChatRequest } from './sendChatRequest';


export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('llm-switchboard.switchboard', () => {
        vscode.window.showInformationMessage('Choose an AI assistant');
        console.log('Switchboard activated');
        const modelSelection = vscode.window.createQuickPick();
        modelSelection.items = [
            { label: 'deepseek-r1:8b', description: 'DeepSeek\'s first-generation of reasoning models with comparable performance to OpenAI-o1' },
            { label: 'llama3.2', description: 'Meta\'s Llama 3.2 goes small with 1B and 3B models' },
        ];
        modelSelection.onDidChangeSelection(selection => {
            if (selection[0]) {
                vscode.window.showInformationMessage(`You selected: ${selection[0].label}`);
                modelSelection.hide();
                const panel = vscode.window.createWebviewPanel(
                    'llmChat',
                    'LLM Chat',
                    vscode.ViewColumn.Two, // Show in the left column
                    {
                        enableScripts: true, // Enable JS for interactivity
                        retainContextWhenHidden: true, // Keep chat state when hidden
                    }
                );

                // HTML content for the chat window
                panel.webview.html = getWebviewContent();

                // Listen for messages from the webview
                panel.webview.onDidReceiveMessage(async (message) => {
                    if (message.command === 'sendMessage') {
                        const userMessage = message.text;
                        const response = await sendChatRequest(userMessage, selection[0].label);  // Call API with the user message
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


