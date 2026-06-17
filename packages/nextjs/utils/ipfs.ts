const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export const uploadFileToIPFS = async (file: File) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error("Pinata API keys are missing");
    throw new Error("Pinata API keys are missing");
  }

  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: data,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload file to IPFS: ${res.statusText}`);
  }

  const responseData = await res.json();
  return `ipfs://${responseData.IpfsHash}`;
};

export const uploadJSONToIPFS = async (json: any) => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    console.error("Pinata API keys are missing");
    throw new Error("Pinata API keys are missing");
  }

  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_API_KEY,
    },
    body: JSON.stringify(json),
  });

  if (!res.ok) {
    throw new Error(`Failed to upload JSON to IPFS: ${res.statusText}`);
  }

  const responseData = await res.json();
  return `ipfs://${responseData.IpfsHash}`;
};

// Helper function to resolve IPFS URIs to HTTP gateways
export const resolveIPFS = (url: string) => {
  if (!url || !url.includes("ipfs://")) return url;
  return url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
};
