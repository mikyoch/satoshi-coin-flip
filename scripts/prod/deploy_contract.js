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

function getPrivateKey(keypair) {
  const keyPair = JSON.stringify(keypair);
  const secretKey = JSON.parse(keyPair)?.keypair?.secretKey;
  let arr = Array.from(Object.values(secretKey));
  let privkey = arr.slice(0, 32);
  return privkey;
}

async function createFundedHouseAccount() {
  const provider = new JsonRpcProvider(Network.DEVNET);
  const keypair = new Ed25519Keypair();

  const privKey = getPrivateKey(keypair);

  const signer = new RawSigner(keypair, provider);
  const address = await signer.getAddress();
  //   await provider.requestSuiFromFaucet(address);
  return { signer, address, privKey };
}

async function publishSatoshiPackage() {
  const { signer, address, privKey } = await createFundedHouseAccount();
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
    return { packageAddress, houseAddress: address, housePrivateKey: privKey };
  } else {
    console.log("failed to publish package");
  }
}

publishSatoshiPackage();

module.exports.publishSatoshiPackage = publishSatoshiPackage;
