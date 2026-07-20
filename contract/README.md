# Workproof Escrow Contract

Soroban smart contract implementing milestone escrow: `create_job`, `fund_milestone`,
`mark_delivered`, `approve_milestone`, `dispute_milestone`, `claim_timeout_release`, `get_job`.

## Prereqs

```bash
rustup target add wasm32-unknown-unknown
curl -sSfL https://soroban.stellar.org/install.sh | sh   # or: cargo install --locked stellar-cli
```

## Test

```bash
cd contract
cargo test
```

## Build

```bash
stellar contract build
# wasm output: target/wasm32-unknown-unknown/release/workproof_escrow.wasm
```

## Deploy to testnet

```bash
stellar keys generate deployer --network testnet --fund

stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/workproof_escrow.wasm \
  --source deployer \
  --network testnet
# copy the returned contract ID into .env.local as NEXT_PUBLIC_ESCROW_CONTRACT_ID
```

## Generate TS bindings for the frontend

```bash
stellar contract bindings typescript \
  --contract-id <CONTRACT_ID> \
  --network testnet \
  --output-dir ../lib/generated/escrow-client
```

Then swap the manual ScVal calls in `lib/contract.ts` for the generated client.

This step requires your own funded testnet account and cannot be done from
an unattended agent — run it yourself.
