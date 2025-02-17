interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  [key: string]: any;
}

export interface PendingRequest {
  id: string;
  method: string;
  params: any[];
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export const pendingRequests = new Map<string, PendingRequest>();

export function createProxy(ethereum: EthereumProvider): EthereumProvider {
  return new Proxy(ethereum, {
    get: function (target: EthereumProvider, prop: string, _: any) {
      const value = target[prop];

      if (typeof value === "function") {
        return function (...args: any[]) {
          if (prop === "request") {
            const signMethods = [
              "eth_sign",
              "personal_sign",
              "eth_signTransaction",
              "eth_sendTransaction",
            ];

            if (args[0] && signMethods.includes(args[0].method)) {
              console.log("🔐 Intercepting transaction request:", args[0]);
              const requestId = Math.random().toString(36).substring(7);
              return new Promise(async (resolve, reject) => {
                const chainId = await ethereum.request({
                  method: "eth_chainId",
                });

                window.postMessage(
                  {
                    type: "SAFUW_OPEN_POPUP",
                    pendingTransaction: {
                      id: requestId,
                      method: args[0].method,
                      params: args[0].params,
                      chainId: parseInt(chainId, 16).toString(),
                    },
                  },
                  "*"
                );

                pendingRequests.set(requestId, {
                  id: requestId,
                  method: args[0].method,
                  params: args[0].params,
                  resolve,
                  reject,
                });
              });
            }
          }

          return value.apply(target, args);
        };
      }

      return value;
    },
  });
}
