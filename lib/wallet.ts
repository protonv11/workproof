import {
  isConnected,
  isAllowed,
  requestAccess,
  getAddress,
  getNetwork,
  signTransaction,
} from "@stellar/freighter-api";

export const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015";

// Stellar Asset Contract address for native XLM on testnet — default escrow token.
export const NATIVE_TESTNET_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export function truncateAddress(address: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars)}…${address.slice(-chars)}`;
}

export async function isFreighterInstalled() {
  const res = await isConnected();
  return !!res.isConnected && !res.error;
}

export async function connectFreighter() {
  const allowed = await isAllowed();
  if (!allowed.isAllowed) {
    const access = await requestAccess();
    if (access.error) throw new Error(access.error.message ?? "Freighter access denied");
  }
  const addr = await getAddress();
  if (addr.error) throw new Error(addr.error.message ?? "Failed to get address");
  return addr.address;
}

export async function getCurrentNetwork() {
  const network = await getNetwork();
  if (network.error) throw new Error(network.error.message ?? "Failed to get network");
  return network;
}

export async function signXdr(xdr: string, address: string) {
  const res = await signTransaction(xdr, {
    networkPassphrase: TESTNET_PASSPHRASE,
    address,
  });
  if (res.error) throw new Error(res.error.message ?? "Failed to sign transaction");
  return res.signedTxXdr;
}
