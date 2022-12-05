// const { execSync } = require("child_process");
const { fromB64 } = require("@mysten/bcs");
const fs = require("fs");

const {
  JsonRpcProvider,
  Network,
  Ed25519Keypair,
  RawSigner,
} = require("@mysten/sui.js");
const bytecode = require("../../satoshi_flip/base64Bytecode.json");

// @todo: should be removed, temporarily here
function base64KeyStoreToPrivateKeyBase64(base64KeyStore) {
  let buf_array = fromB64(base64KeyStore);
  let arr = Array.from(buf_array);
  arr.shift();
  let pub_key = arr.slice(0, 32);
  let privkey = arr.slice(32, 64);
  console.log("private key array", privkey);
  const keypair = Ed25519Keypair.fromSeed(Uint8Array.from(privkey));
  console.log("keypair", keypair);
  return keypair;
}

async function createFundedHouseAccount() {
  const provider = new JsonRpcProvider(Network.DEVNET);
  const keypair = base64KeyStoreToPrivateKeyBase64(
    "AFO1xQq1nCy8CUG3ulY0v7uiMlU+76lKk2fPgx2Y0W0vEEw7lxszJkqHO1dLV3F3nL3EjwL5jF13JYuY7nrqcug="
  );
  //   const keypair = new Ed25519Keypair();
  const signer = new RawSigner(keypair, provider);
  const address = await signer.getAddress();
  console.log("address", address);
  //   await provider.requestSuiFromFaucet(address);
  return signer;
}

async function publishSatoshiPackage() {
  const signer = await createFundedHouseAccount();

  const publishTxn = await signer.publish({
    compiledModules: bytecode,
    gasBudget: 10000,
  });

  const effects = publishTxn?.EffectsCert
    ? publishTxn?.EffectsCert?.effects?.effects
    : publishTxn?.effects;

  const status = effects?.status?.status;

  if (status === "success") {
    let newObjects = effects?.events?.find((x) => x.publish) || {};

    const packageAddress = newObjects?.publish?.packageId;
    console.log("packageAddress", packageAddress);
  } else {
    console.log("failed to publish package");
  }
}



module.exports.publishSatoshiPackage = publishSatoshiPackage;
