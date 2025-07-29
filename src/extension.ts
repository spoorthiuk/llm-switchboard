import * as vscode from 'vscode';
import { getWebviewContent } from './webviewContent';
import { sendChatRequest } from './sendChatRequest';
import { exec } from 'child_process';

class LlmTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
    getTreeItem(element: vscode.TreeItem): vscode.TreeItem { return element; }
    getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
        // Single clickable item
        const item = new vscode.TreeItem('Open LLM Switchboard');
        item.command = { command: 'llm-switchboard.switchboard', title: 'Open LLM Switchboard' };
        item.iconPath = new vscode.ThemeIcon('comment-discussion');
        return [item];
    }
}

/**
 * Fetches the list of installed Ollama models by running 'ollama list' in the shell.
 * @returns Promise resolving to an array of model names.
 */
async function fetchInstalledModels(): Promise<string[]> {
    return new Promise((resolve, reject) => {
        exec('ollama list', (error, stdout) => {
            if (error) {
                vscode.window.showErrorMessage("Failed to fetch Ollama models. Is Ollama installed?");
                return reject(error);
            }
            // Parse the output to extract model names, skipping the header line
            const models = stdout
                .split('\n')
                .slice(1)
                .map(line => line.split(/\s+/)[0])
                .filter(name => name);
            resolve(models);
        });
    });
}

/**
 * Called when the extension is activated.
 * Registers the main command and sets up the chat UI and messaging.
 */
export function activate(context: vscode.ExtensionContext) {
    // Register the TreeView for the sidebar
    const treeProvider = new LlmTreeProvider();
    vscode.window.registerTreeDataProvider('llmSwitchboardView', treeProvider);

    // Register the main command for the switchboard
    const disposable = vscode.commands.registerCommand('llm-switchboard.switchboard', async () => {
        vscode.window.showInformationMessage('Choose an AI assistant');
        console.log('Switchboard activated');
        const modelSelection = vscode.window.createQuickPick();
        const models = await fetchInstalledModels();

        // Populate the quick pick with available models
        modelSelection.items = models.map((model: string) => ({
            label: model
        }));

        // Handle model selection
        modelSelection.onDidChangeSelection(selection => {
            const selectedModel = selection[0].label;
            if (selection[0]) {
                vscode.window.showInformationMessage(`You selected: ${selectedModel}`);
                modelSelection.hide();
                // Create a new webview panel for the chat UI
                const panel = vscode.window.createWebviewPanel(
                    'llmChat',
                    `${selectedModel}`,
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    }
                );

                // Set the HTML content for the chat window
                panel.webview.html = getWebviewContent();

                // Listen for messages from the webview (user input)
                panel.webview.onDidReceiveMessage(async (message) => {
                    if (message.command === 'sendMessage') {
                        const userMessage = message.text;
                        // Send the user message to the LLM and get the response
                        const response = await sendChatRequest(userMessage, selectedModel);  // Call API with the user message
                        // Send the AI response back to the webview to display
                        panel.webview.postMessage({ command: 'receiveMessage', text: response });  // Send response back to webview
                    }
                });
            }
        });

        // Clean up the quick pick UI when hidden
        modelSelection.onDidHide(() => modelSelection.dispose());
        modelSelection.show();
    });

    // Add a status bar button to launch the switchboard
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(comment-discussion) LLM Switchboard';
    statusBarItem.tooltip = 'Open LLM Switchboard';
    statusBarItem.command = 'llm-switchboard.switchboard'; // This triggers your command
    statusBarItem.show();

    // Add to extension context subscriptions for cleanup
    context.subscriptions.push(disposable, statusBarItem);
}

// This method is called when your extension is deactivated
export function deactivate() {}