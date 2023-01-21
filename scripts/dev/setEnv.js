// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

const { execSync } = require("child_process");
const { fromB64 } = require("@mysten/bcs");
const { Ed25519Keypair } = require("@mysten/sui.js");
const fs = require("fs");
const { deploy } = require("./deploy_contract");
const hkdf = require("futoin-hkdf");
const bls = require('@noble/bls12-381');

const envAPIScheme = {
  PORT: "",
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  TRUSTED_ORIGINS: "",
};

const envUIScheme = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "",
};

const defaultAPIEnvValues = {
  PORT: 8080,
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  environment: "dev",
  TRUSTED_ORIGINS: '["http://localhost:3000"]',
};

const defaultUIEnvValues = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080",
};

function getEnvJson(folderName = "api") {
  const envJson = folderName === "api" ? envAPIScheme : envUIScheme;
  const defaultJson =
    folderName === "api" ? defaultAPIEnvValues : defaultUIEnvValues;

  if (!fs.existsSync(`./../${folderName}/.env`)) {
    execSync(`touch ./../${folderName}/.env`);
    writeEnv(envJson);
  }
  const data = fs.readFileSync(`./../${folderName}/.env`, {
    encoding: "utf-8",
  });
  const lines = data.split("\n");
  for (let line of lines) {
    if (line.indexOf("=") > 0) {
      const [key, value] = line.split("=");
      envJson[key] = value || defaultJson[key];
    }
  }
  return envJson;
}

function writeEnv(envJson, folderName = "api") {
  const defautValues =
    folderName === "api" ? defaultAPIEnvValues : defaultUIEnvValues;
  let env = "";
  for (let [key, value] of Object.entries(envJson)) {
    if (Array.isArray(value)) env += `${key}=[${value}]\n`;
    else env += `${key}=${value || defautValues[key]}\n`;
  }

  fs.writeFileSync(`./../${folderName}/.env`, env);
}

function writePK(sk){
  let finalPK = '[';
  const pk = bls.getPublicKey(sk);
  finalPK += pk.toString() + ']';
  fs.writeFileSync('./pk.keystore', finalPK);
}

function deriveBLS_SK(private_key) {
  // initial key material
  const ikm = private_key;
  const length = 32;
  const salt = "satoshi";
  const info = "bls-signature";
  const hash = 'SHA-256';
  const derived_sk = hkdf(ikm, length, {salt, info, hash});
  return Uint8Array.from(derived_sk);
}

function main() {
  // get keystore base64 vaules
  const stdout = execSync("cat ~/.sui/sui_config/sui.keystore");
  const keystoreArray = JSON.parse(stdout);
  //find ed255519
  let edKeypair;
  for (let encodedStr of keystoreArray) {
    const uintArr = fromB64(encodedStr);
    const arr = Array.from(uintArr);
    let scheme = arr.shift();
    if (scheme === 0) {
      edKeypair = arr;
      break;
    }
  }

  const privKeyArr = edKeypair;
  const keypair = Ed25519Keypair.fromSeed(Uint8Array.from(privKeyArr));

  const bankerAddress = `0x${keypair.getPublicKey().toSuiAddress()}`;

  const envAPIJson = getEnvJson("api");
  const envUIJson = getEnvJson("ui");
  envAPIJson.BANKER_ADDRESS = bankerAddress;
  envAPIJson.PRIVATE_KEY = privKeyArr;
  const derived_bls_key = deriveBLS_SK(privKeyArr);
  writePK(derived_bls_key);
  // write initial api and ui env (if it doesn't exist) because it is needed for the deployment
  writeEnv(envAPIJson, "api");
  envUIJson.NEXT_PUBLIC_PACKAGE = envAPIJson.PACKAGE_ADDRESS;
  writeEnv(envUIJson, "ui");
  if (envAPIJson.PACKAGE_ADDRESS == null || envAPIJson.PACKAGE_ADDRESS === "") {
    const newPackageAddress = deploy();
    envAPIJson.PACKAGE_ADDRESS = newPackageAddress;
    envUIJson.NEXT_PUBLIC_PACKAGE = newPackageAddress;
    // if we have new contract deployment update the package address on the api and on ui
    writeEnv(envAPIJson, "api");
    writeEnv(envUIJson, "ui");
  }
}

main();
