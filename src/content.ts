import { PubSub } from "./pubsub";
import { buildPrompt, checkIfUrlContainsPath, findParentBySelector, getContext } from "./utils";
const pubSub = new PubSub();
namespace __assistant__element_store {
  export let lastActiveElement: HTMLDivElement;

  export function set(elm: HTMLDivElement) {
    lastActiveElement = elm;
  }

  export function get() {
    return lastActiveElement;
  }
}

const __assistant__buttons_store = (function () {
  const buttons: HTMLDivElement[] = [];
  return {
    push: (btn: HTMLDivElement) => buttons.push(btn),
    clear: () => (buttons.length = 0),
    get: () => buttons,
  };
})();
const __assistant__BUTTONS = ["generate"];

pubSub.subscribe(
  "update-last-active-element-innerHtml",
  (result: string) => (__assistant__element_store.get().innerHTML = result)
);
pubSub.subscribe("last-active-element", (div: HTMLDivElement) =>
  __assistant__element_store.set(div)
);

pubSub.subscribe("insert-text", (text: string) => {
  const spl_text = text.replace(/^\s+|\s+$/g, "").split("\n");
  var res = "";

  for (const s of spl_text) {
    if (s == "") {
      res += "<p></p>";
    } else {
      res += "<p>" + s + "</p>";
    }
  }

  pubSub.publish("update-last-active-element-innerHtml", res);
});

const _extractText = (target: HTMLDivElement) => {
  let txt = target.innerText;
  if (txt) {
    txt = txt.replace(/(\s)+/g, "$1");
    txt = txt.trim();
    return txt;
  }
};

pubSub.subscribe("create-buttons", (parent: HTMLDivElement) => {
  if (!checkIfUrlContainsPath('messaging')) return

  for (const [index, image] of __assistant__BUTTONS.entries()) {
    // Create button
    const button = document.createElement("div");
    button.style.width = "24px";
    button.style.height = "24px";
    button.id = `generate-button-${index}`;
    button.classList.add("inline-block");
    button.classList.add("generate-button");

    // Add image inside button
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL(`images/${image}.png`);
    img.style.pointerEvents = "none";
    img.style.width = "24px";
    img.style.height = "24px";
    button.appendChild(img);

    // Add onclick event
    button.addEventListener("click", () => {
      try {
        const text = _extractText(parent)!;
        const prompt =
          image === "correct"
            ? "Correct this to standard English:\n\n"
            : buildPrompt(text, getContext());
        parent.focus();
        _setButtonLoading();
        chrome.runtime.sendMessage({ text: prompt });
      } catch (error) {
        console.error(error);
      }
    });
    const form = findParentBySelector(parent, '.msg-form');
    const formLeftAction = form?.querySelector('.msg-form__left-actions');
    // Append button to parent of input
    formLeftAction?.appendChild(button);
    __assistant__buttons_store.push(button);
  }
});

pubSub.subscribe("delete-buttons", () => {
  __assistant__buttons_store.get().forEach((btn) => {
    btn.remove();
  });
  __assistant__buttons_store.clear();
});

const getAllEditable = () => {
  return document.querySelectorAll<HTMLDivElement>('[role="textbox"]');
};

const _setButtonLoading = () => {
  __assistant__buttons_store.get().forEach((button) => {
    button.innerHTML = "<div class='spinner'></div>";
    button.style.pointerEvents = "none";

    // Remove all classes
    button.classList.remove("generate-button-error");

    // add loading class to button
    button.classList.add("generate-button-loading");
  });
};

pubSub.subscribe("set-button-error", (err: Error) => {
  console.log(err);
});

pubSub.subscribe("set-button-loaded", () => {
  __assistant__buttons_store.get().forEach((button, idx) => {
    // Remove all classes
    button.classList.remove("generate-button-loading");
    button.classList.remove("generate-button-error");

    // Add image inside button
    const img = document.createElement("img");
    img.src = chrome.runtime.getURL(`images/${__assistant__BUTTONS[idx]}.png`);
    button.innerHTML = "";
    button.style.pointerEvents = 'auto';
    button.appendChild(img);
  });
});

const handleClick = (e: any) => {
  // If element is GPT-3 button, do nothing
  if (__assistant__buttons_store.get().includes(e.target)) {
    return;
  }

  // If element is in editable parent, create button
  const editableDivs = getAllEditable();
  for (const div of editableDivs) {
    if (div.contains(e.target)) {
      pubSub.publish("delete-buttons", null);
      pubSub.publish("last-active-element", div);
      pubSub.publish("create-buttons", div);
      break;
    }
  }
};

// Add event listeners
document.body.addEventListener("click", handleClick);
document.body.addEventListener("resize", () =>
  pubSub.publish("delete-buttons", null)
);
document.body.addEventListener("scroll", () =>
  pubSub.publish("delete-buttons", null)
);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request) => {
  if (request.generate) {
    if (request.generate.error) {
      pubSub.publish("set-button-error", request.generate.error.message);
      return;
    }

    pubSub.publish("insert-text", request.generate.text ?? "");
    pubSub.publish("set-button-loaded", null);
  }
});
