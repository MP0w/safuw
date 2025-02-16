const script = document.createElement("script");
script.src = chrome.runtime.getURL("dist/pageScript.js");
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the page script
window.addEventListener("message", (event) => {
  const shouldForward =
    typeof event.data.type === "string" && event.data.type.startsWith("SAFUW_");

  if (!shouldForward) {
    return;
  }

  console.log(
    "🔄 Received message from page script, forwarding to extension:",
    event.data.type
  );

  chrome.runtime.sendMessage({
    ...event.data,
  });
});

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const shouldForward =
    typeof message.type === "string" && message.type.startsWith("SAFUW_");

  if (!shouldForward) {
    return;
  }

  console.log(
    "📩 Content script received extension message forwarding to page script:",
    message
  );

  const expectReply = message.type.startsWith("SAFUW_GET_");
  if (expectReply) {
    const listener = (event: MessageEvent) => {
      if (
        typeof event.data.type === "string" &&
        event.data.type === message.type + "_RESPONSE"
      ) {
        const response = {
          type: message.type,
          ...event.data,
        };

        sendResponse(JSON.parse(JSON.stringify(response, null, 2)));
        window.removeEventListener("message", listener);
      }
    };

    window.addEventListener("message", listener);
  }

  window.postMessage(
    {
      ...message,
    },
    "*"
  );

  return expectReply;
});
