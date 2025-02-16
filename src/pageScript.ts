import { createProxy } from "./ethereumProxy";
import { handleGetAddress } from "./MessageHandlers/getAddressHandler";
import { handleTransactionResponse } from "./MessageHandlers/transactionResponseHandler";

// Listen for messages from the content script
window.addEventListener("message", (event) => {
  const isOwnMessage =
    typeof event.data.type === "string" && event.data.type.startsWith("SAFUW_");

  if (!isOwnMessage) {
    return;
  }

  console.log("🔄 received message in page script:", event.data.type);

  if (event.data.type === "SAFUW_GET_CURRENT_ADDRESS") {
    handleGetAddress(event);
  } else if (event.data.type === "SAFUW_TRANSACTION_RESPONSE") {
    handleTransactionResponse(event);
  }
});

const unsafeWindow = window as any;
unsafeWindow.ogEthereum = unsafeWindow.ethereum;
if ("ethereum" in unsafeWindow) {
  delete unsafeWindow.ethereum;
}

Object.defineProperty(window, "ethereum", {
  configurable: true,
  enumerable: true,
  get: function () {
    return unsafeWindow.ogEthereum
      ? createProxy(unsafeWindow.ogEthereum)
      : undefined;
  },
  set: function (value) {
    unsafeWindow.ogEthereum = value;
  },
});
