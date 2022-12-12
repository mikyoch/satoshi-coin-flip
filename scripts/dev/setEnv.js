const { execSync } = require("child_process");
const { fromB64 } = require("@mysten/bcs");
const { Ed25519PublicKey } = require("@mysten/sui.js");
const fs = require("fs");
const { deploy } = require("./deploy_contract");

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
  const pubKeyArr = edKeypair.slice(0, 32);
  const privKeyArr = edKeypair.slice(32);

  const pubKeyClass = new Ed25519PublicKey(pubKeyArr);
  const pubkey = `0x${pubKeyClass.toSuiAddress()}`;

  const envAPIJson = getEnvJson("api");
  const envUIJson = getEnvJson("ui");
  envAPIJson.BANKER_ADDRESS = pubkey;
  envAPIJson.PRIVATE_KEY = privKeyArr;
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
