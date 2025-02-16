import { pendingRequests } from "../ethereumProxy";

export function handleTransactionResponse(event: MessageEvent<any>) {
  const { id, approved } = event.data;
  const request = pendingRequests.get(id);
  if (request) {
    if (approved) {
      // Forward the request to the actual wallet
      (window as any).ogEthereum
        .request({ method: request.method, params: request.params })
        .then(request.resolve)
        .catch(request.reject);
    } else {
      request.reject(new Error("Transaction rejected by user"));
    }
    pendingRequests.delete(id);
  }
}
