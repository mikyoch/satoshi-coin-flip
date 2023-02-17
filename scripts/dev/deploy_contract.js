// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

const fs = require("fs");
const { execSync } = require("child_process");

function getAddress() {
  const data = fs.readFileSync("./../api/.env", { encoding: "utf-8" });
  const lines = data.split("\n");
  for (let line of lines) {
    if (line.indexOf("BANKER_ADDRESS") >= 0) {
      const [_, address] = line.split("=");
      return address;
    }
  }
}

function setAddressAsCurrent(address) {
  const activeAddress = execSync("sui client active-address").toString();
  if (activeAddress !== address) {
    execSync(`sui client switch --address ${address}`);
  }
}

function writeHouseCap(cap_id) {
  fs.writeFileSync("./house_cap.txt", cap_id.toString());
}

function publish(address) {
  try {
    const result = execSync(
      "sui client publish --json --gas-budget 10000 ../satoshi_flip/"
    ).toString();
    const resultJson = JSON.parse(result);
    const packageObject = resultJson?.effects?.created.find(
      (val) => val?.owner == "Immutable"
    );
    const houseCapObject = resultJson?.effects?.created.find(
      (val) => val?.owner?.AddressOwner == address
    );
    if (
      packageObject.owner === "Immutable" &&
      houseCapObject?.owner?.AddressOwner === address
    ) {
      writeHouseCap(houseCapObject.reference.objectId);
      return packageObject.reference.objectId;
    } else {
      throw "Error!! Invalid artifacts produced from compilation!";
    }
  } catch (e) {
    console.error("Error during publishing", e);
  }
}

function deploy() {
  let address = getAddress();
  setAddressAsCurrent(address);
  return publish(address);
}

module.exports.deploy = deploy;
