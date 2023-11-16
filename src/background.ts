const getUrl = async () => {
  const {
    localLLMUrl,
  } = await chrome.storage.sync.get([
    "localLLMUrl",
  ]);
  return localLLMUrl
}
const getNextTokens = async (prompt: string) => {
  const url = await getUrl();
  try {


    // Create request body
    const data = {
      inputs: prompt,
      "parameters": {
        "temperature": 0.3,
        "top_p": 0.95,
        "repetition_penalty": 1.3,
        "top_k": 50,
        "truncate": 1024,
        "max_new_tokens": 1024,
        "stop": ["<|im_start|>user\n"]
      },
    };

    // Create headers
    const headers = {
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (json.error) {
      return { error: json.error };
    }

    return { text: json.generated_text };
  } catch (err) {
    return { error: err };
  }
};

chrome.runtime.onMessage.addListener(async (request) => {
  if (request.text != null) {
    // Communicate with content script to get the current text
    const prompt = request.text;
    const nextTokens = await getNextTokens(prompt);

    // Communicate with content script to update the text
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0]!.id!, { generate: nextTokens });
    });
  }
});
