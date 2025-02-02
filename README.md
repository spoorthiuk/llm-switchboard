# LLMSwitchboard README

LLMSwitchboard is a VS Code extension that allows users to chat with multiple offline large language models (LLMs) directly within their editor. This extension provides seamless interaction with locally hosted AI models for coding assistance, debugging, and general inquiries—all while keeping data private.

Unlike cloud-based AI assistants, LLMSwitchboard ensures that all interactions remain local, meaning no data leaves your machine. This is particularly beneficial for developers working with confidential codebases, offline environments, or those concerned with data privacy.

With its intuitive chat interface, model-switching capabilities, and context-awareness, LLMSwitchboard enhances the developer experience by providing intelligent, real-time code suggestions and explanations without requiring internet access. Whether you're debugging an error, refactoring code, or seeking general programming guidance, LLMSwitchboard empowers you with AI-assisted coding directly within your workflow.

## Features

* 🤖 Multiple LLM Support – Switch between different local AI models easily.
* 🔌 Offline Chat – No internet connection required; all processing is done locally.
* 📌 Integrated UI – Chat window opens alongside the editor for a seamless experience.
* 🔒 Privacy First – No external API calls; all conversations stay on your device.

*Coming soon!* 

📝 Context Awareness – Parse open code files for more relevant AI responses.

## Requirements

To use LLMSwitchboard, ensure the following dependencies are installed:
* A locally running LLM server from [Ollama](https://ollama.com)

### Setup Instructions
1. Install the extension from the VS Code Marketplace or manually from GitHub.
2. Ensure your local LLM server is running (http://localhost:11434/api/chat).
3. Open VS Code and run "LLM Switchboard" from the command palette.
4. Select your preferred model and start chatting!

## Extension Settings

1. Install the extension from the VS Code Marketplace or manually from GitHub.
2. Ensure your local LLM server is running (http://localhost:11434/api/chat).
3. Open VS Code and run "LLM Switchboard" from the command palette.
4. Select your preferred model and start chatting!

## Known Issues

* *Long response times*: Some models may take time to generate responses depending on hardware.
* *Incomplete responses*: Some LLMs might have output truncation issues.
* *Limited model compatibility*: Only supports local models with a REST API.
If you encounter any issues, please report them in the [GitHub Issues](https://github.com/spoorthiuk/llm-switchboard/issues) section.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

* Initial release with core chat functionality.
* Support for multiple offline LLMs available on [Ollama](https://ollama.com/search).
* Chat window opens next to the code editor.
* Basic model selection via quick pick.

### 1.0.1 (Upcoming)

* Copy-to-clipboard button for code blocks.
* Improved chat UI with formatting.
* Context awareness by parsing open code files

