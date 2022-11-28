const { execSync } = require("child_process");
const { fromB64 } = require("@mysten/bcs");
const { Ed25519PublicKey } = require("@mysten/sui.js");
const fs = require("fs");
const { deploy } = require("./deploy_contract");

function getEnvJson() {
  const envJson = {
    PORT: "",
    PRIVATE_KEY: "",
    BANKER_ADDRESS: "",
    PACKAGE_ADDRESS: "",
    environment: "",
    trustedOriginsDev: "",
    trustedOriginsProd: "",
  };
  const data = fs.readFileSync("./.env", { encoding: "utf-8" });
  const lines = data.split("\n");
  for (let line of lines) {
    if (line.indexOf("=") >= 0) {
      const [key, value] = line.split("=");
      envJson[key] = value;
    }
  }
  return envJson;
}

function writeEnv(envJson) {
  let env = "";
  for (let [key, value] of Object.entries(envJson)) {
    if (Array.isArray(value)) env += `${key}=[${value}]\n`;
    else env += `${key}=${value}\n`;
  }
  fs.writeFileSync("./.env", env);
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

  const envJson = getEnvJson();
  envJson.BANKER_ADDRESS = pubkey;
  envJson.PRIVATE_KEY = privKeyArr;
  if (envJson.PACKAGE_ADDRESS == null || envJson.PACKAGE_ADDRESS === "") {
    const newPackageAddress = deploy();
    envJson.PACKAGE_ADDRESS = newPackageAddress;
  }
  writeEnv(envJson);
}

main();
