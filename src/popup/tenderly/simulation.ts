interface TenderlySimulationRequest {
  network_id: string;
  from: string;
  to: string;
  input: string;
  gas?: number;
  gas_price?: string;
  value: string;
  save: boolean;
  save_if_fails: boolean;
}

interface TenderlySimulationResponse {
  url: string;
  transaction: {
    status: boolean;
    error_message?: string;
  };
  simulation: {
    id: string;
    status: boolean;
    gas_used: number;
  };
}

export async function executeTenderlySimulationFromRawTransaction(params: {
  id: string;
  method: string;
  params: any[];
  chainId: string;
}) {
  return await executeTenderlySimulation({
    network_id: params.chainId,
    from: params.params[0].from,
    to: params.params[0].to,
    input: params.params[0].data,
    value: params.params[0].value || "0",
    save: true,
    save_if_fails: true,
  });
}

async function executeTenderlySimulation(
  params: TenderlySimulationRequest
): Promise<TenderlySimulationResponse> {
  const TENDERLY_USER = process.env.TENDERLY_USER!;
  const TENDERLY_PROJECT = process.env.TENDERLY_PROJECT!;
  const TENDERLY_API_KEY = process.env.TENDERLY_API_KEY!;

  const headers = {
    "Content-Type": "application/json",
    "X-Access-Key": TENDERLY_API_KEY,
  };
  const baseUrl = `https://api.tenderly.co/api/v1/account/${TENDERLY_USER}/project/${TENDERLY_PROJECT}`;
  const url = `${baseUrl}/simulate`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const body = await response.json();
    throw new Error(
      `HTTP error! status: ${response.status} ${JSON.stringify(body)}`
    );
  }

  const data = await response.json();

  await fetch(`${baseUrl}/simulations/${data.simulation.id}/share`, {
    method: "POST",
    headers,
  });

  return {
    ...data,
    url: `https://tdly.co/shared/simulation/${data.simulation.id}`,
  } as TenderlySimulationResponse;
}
