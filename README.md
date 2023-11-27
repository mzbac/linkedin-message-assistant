# Linkedin-AI-Writer

A Chrome extension integrated with your open source LLM to help you write better Linkedin messages.

## Installation

- Download `chrome.zip` from [Releases](https://github.com/mzbac/gpt3-linkedin/releases)
- Unzip the file
- In Chrome/Edge go to the extensions page (`chrome://extensions` or `edge://extensions`).
- Enable Developer Mode.
- Drag the unzipped folder anywhere on the page to import it (do not delete the folder afterwards).
- Click on the extension icon.
- Paste your local LLM url (e.g. `http://localhost:8000/generate`) and click on `Save`.
- Open Linkedin message page in your browser.
- Type your objective or intention of the message in the text box and click the button at the bottom to generate the message.
- Enjoy!

## Development

### Install npm packages

```sh
npm install
```

### Build the extension

```sh
npm run build
```

## Limitations

- Currently, only the [dolphin-2.2-yi-34b](https://huggingface.co/ehartford/dolphin-2_2-yi-34b) model prompt format is supported due to it being the best model I found for writing LinkedIn messages assistant.
- The backend API only supports HuggingFace text generation inference because it is the most production-ready and easy to use. You can lauch the backend via docker command as shown below:
    ```sh
    docker run --gpus all --shm-size 1g -p 8000:80 -v $PWD/models:/data ghcr.io/huggingface/text-generation-inference:latest --max-total-tokens 2050 --max-input-length 1024 --max-batch-prefill-tokens 2048 --quantize awq --model-id TheBloke/dolphin-2_2-yi-34b-AWQ
    ```