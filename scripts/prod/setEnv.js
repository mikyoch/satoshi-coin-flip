// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

const { execSync } = require("child_process");
const fs = require("fs");
const { publishSatoshiPackage } = require("./deploy_contract");

const envUIScheme = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "",
};

const defaultUIEnvValues = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080",
};

const envAPIScheme = {
  PORT: "",
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  TRUSTED_ORIGINS: "",
};

const defaultAPIEnvValues = {
  PORT: 8080,
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  TRUSTED_ORIGINS: '["http://localhost:3000"]',
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

async function main() {
  const { packageAddress, houseAddress, housePrivateKey } =
    await publishSatoshiPackage();

  const envAPIJson = getEnvJson("api");
  const envUIJson = getEnvJson("ui");
  envAPIJson.BANKER_ADDRESS = `0x${houseAddress}`;
  envAPIJson.PRIVATE_KEY = housePrivateKey;
  envAPIJson.PACKAGE_ADDRESS = packageAddress;
  envUIJson.NEXT_PUBLIC_PACKAGE = packageAddress;

  writeEnv(envAPIJson, "api");
  writeEnv(envUIJson, "ui");
}

main();
