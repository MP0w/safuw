export function handleGetAddress(event: MessageEvent<any>) {
  // Request current accounts from the provider
  (window as any).ethereum
    .request({ method: "eth_accounts" })
    .then((accounts: string[]) => {
      window.postMessage(
        {
          type: "SAFUW_GET_CURRENT_ADDRESS_RESPONSE",
          address: accounts[0] || null,
        },
        "*"
      );
    })
    .catch((error: any) => {
      console.error("❌ Error getting accounts:", error);
    });
}
