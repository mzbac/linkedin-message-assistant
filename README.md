# Linkedin-AI-Writer

A Chrome extension integrated with your open source LLM to help you write better Linkedin messages.

[![demo](https://img.youtube.com/vi/_uDGL_fvuwY/0.jpg)](https://youtube.com/shorts/_uDGL_fvuwY)

## Installation

- Download `chrome.zip` from [Releases](https://github.com/mzbac/linkedin-message-assistant/releases/tag/1.1.1).
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
- The backend API only supports HuggingFace text generation inference and llama.cpp server. You can lauch the backend as shown below:
    ```sh
    docker run --gpus all --shm-size 1g -p 8000:80 -v $PWD/models:/data ghcr.io/huggingface/text-generation-inference:latest --max-total-tokens 2050 --max-input-length 1024 --max-batch-prefill-tokens 2048 --quantize awq --model-id TheBloke/dolphin-2_2-yi-34b-AWQ
    ```

    ```
    #!/bin/bash

    # Define the repository and model details
    REPO_URL="git@github.com:ggerganov/llama.cpp.git"
    REPO_DIR="llama.cpp"
    MODEL_URL="https://huggingface.co/TheBloke/dolphin-2_2-yi-34b-GGUF/resolve/main/dolphin-2_2-yi-34b.Q4_K_M.gguf"
    MODEL_FILE="dolphin-2_2-yi-34b.Q4_K_M.gguf"

    # Clone the repository if it doesn't already exist
    if [ ! -d "$REPO_DIR" ]; then
    git clone "$REPO_URL"
    fi

    # Change directory to the cloned repository
    cd "$REPO_DIR"

    # Build the project using make
    # Assume make is idempotent, as it should only rebuild changed files
    make

    # Change directory to the models folder
    mkdir -p models
    cd models

    # Download the model if it doesn't already exist
    if [ ! -f "$MODEL_FILE" ]; then
    wget "$MODEL_URL"
    fi

    # Change directory back to the project root
    cd ../

    # Launch the server
    ./server -m models/"$MODEL_FILE" --host 0.0.0.0 --port 8080 -c 16000
    ```
