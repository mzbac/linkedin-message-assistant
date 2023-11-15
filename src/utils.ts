
export function findParentBySelector(element: Element | null, selector: string): Element | null {
    while (element && !element.matches(selector)) {
        element = element.parentElement;
    }
    return element;
}

export function buildPrompt(userPrompt: string, context: string): string {
    return `<|im_start|>system
Below is an instruction that describes a task. Write a response that appropriately completes the request.<|im_end|>
<|im_start|>user
Create a concise, professional LinkedIn reply to the following LinkedIn message.
Message Thread Context:
\`\`\`
${context}
\`\`\`
Reply Objective: ${userPrompt}
Instruction: Keep the response direct, brief, and professional.
<|im_start|>assistant
`;
}


export function getContext(): string {
    let context = "";
    document.querySelectorAll('.msg-s-message-list__event .msg-s-event__content').forEach(n => context = context + n.textContent?.trim() + "\n")
    return context;
}


export function checkIfUrlContainsPath(specificPath: string): boolean {
    // Get the current URL
    const currentUrl = window.location.href;

    // Parse the URL to get the pathname
    const pathname = new URL(currentUrl).pathname;

    // Check if the pathname includes the specific path
    return pathname.includes(specificPath);
}
