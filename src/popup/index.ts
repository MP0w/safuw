import { executeTenderlySimulationFromRawTransaction } from "./tenderly/simulation";

interface PendingTransaction {
  id: string;
  method: string;
  params: any[];
  chainId: string;
}

document.addEventListener("DOMContentLoaded", async () => {
  let currentTransaction: PendingTransaction | null = null;
  let sourceTabId: number | null = null;

  function updateAddress(tabId: number) {
    chrome.tabs.sendMessage(
      tabId,
      { type: "SAFUW_GET_CURRENT_ADDRESS" },
      (response) => {
        const addressElement = document.getElementById("connected-address");
        if (addressElement) {
          addressElement.textContent = response?.address
            ? `Connected Address: ${response.address}`
            : "No wallet connected";
        }
      }
    );
  }

  function updateDetails(transaction: PendingTransaction, simulation?: string) {
    console.log("🔍 Showing transaction:", transaction);
    const pendingElement = document.getElementById("pending-transaction");
    const detailsElement = document.getElementById("transaction-details");

    if (pendingElement && detailsElement) {
      pendingElement.style.display = "block";
      detailsElement.innerHTML = `
        <p><strong>Simulation URL:</strong> <a href="${
          simulation || "loading..."
        }" target="_blank">View Simulation</a></p>
        <p><strong>Method:</strong> ${transaction.method}</p>
        <p><strong>Params:</strong></p>
        <pre>${JSON.stringify(transaction.params, null, 2)}</pre>
      `;
    }
  }

  async function showTransaction(transaction: PendingTransaction) {
    updateDetails(transaction);
    const simulationResponse =
      await executeTenderlySimulationFromRawTransaction(transaction);
    updateDetails(transaction, simulationResponse.url);
  }

  function handleTransactionResponse(approved: boolean) {
    if (!(currentTransaction && sourceTabId)) {
      console.error("No transaction or source tab ID available");
      return;
    }

    chrome.tabs.sendMessage(sourceTabId, {
      type: "SAFUW_TRANSACTION_RESPONSE",
      approved,
      ...currentTransaction,
    });

    window.close();
  }

  const [currentTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  updateAddress(currentTab?.id || 0);

  // Check for pending transaction
  chrome.storage.local.get(["pendingTransaction", "sourceTabId"], (result) => {
    if (result.pendingTransaction && result.sourceTabId) {
      currentTransaction = result.pendingTransaction;
      sourceTabId = result.sourceTabId;
      showTransaction(result.pendingTransaction);

      chrome.storage.local.remove(["pendingTransaction", "sourceTabId"]);
      updateAddress(sourceTabId || 0);
    }
  });

  document.getElementById("approve-btn")?.addEventListener("click", () => {
    handleTransactionResponse(true);
  });

  document.getElementById("reject-btn")?.addEventListener("click", () => {
    handleTransactionResponse(false);
  });
});
