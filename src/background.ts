const getUrl = async () => {
  const {
    localLLMUrl,
    apiType
  } = await chrome.storage.sync.get([
    "localLLMUrl",
    "apiType"
  ]);
  return [localLLMUrl, apiType]
}
const getNextTokens = async (prompt: string) => {
  const [url, apiType] = await getUrl();
  if (apiType === "TGI") {
    try {
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
  } else {
    try {

      const data = {
        "prompt": prompt,
        "temperature": 0.3,
        "top_p": 0.95,
        "repeat_penalty": 1.3,
        "truncated": 1024,
        "top_k": 50,
        "n_predict": 1024,
        "stop": ["<|im_start|>user\n"]
      };

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

      return { text: json.content.replace('<|im_end|>', '') };
    } catch (err) {
      return { error: err };
    }
  }
};

chrome.runtime.onMessage.addListener(async (request, sender) => {
  if (request.text != null) {
    const prompt = request.text;
    const nextTokens = await getNextTokens(prompt);

    if (sender.tab && sender.tab.id) {
      chrome.tabs.sendMessage(sender.tab.id, { generate: nextTokens });
    }
  }
});
