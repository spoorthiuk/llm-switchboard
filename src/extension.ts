import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getWebviewContent } from './webviewContent';
import { sendChatRequest } from './sendChatRequest';

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('llm-switchboard.switchboard', () => {
        vscode.window.showInformationMessage('Choose an AI assistant');
        console.log('Switchboard activated');
        const modelSelection = vscode.window.createQuickPick();
        const modelsPath = path.join(context.extensionPath, 'src', 'models.json');
        const models = JSON.parse(fs.readFileSync(modelsPath, 'utf8'));

        modelSelection.items = models.map((model: { label: string; description: string }) => ({
            label: model.label,
            description: model.description
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


