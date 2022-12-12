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

function publish() {
  const result = execSync(
    "sui client publish --json --gas-budget 10000 ../satoshi_flip/"
  ).toString();
  const resultJson = JSON.parse(result);
  const packageObject = resultJson?.effects?.created[0]; // Only one object should be created each time
  if (packageObject.owner === "Immutable") {
    return packageObject.reference.objectId;
  } else {
    throw "Error!! Created Object is not Immutable!";
  }
}

function deploy() {
  let address = getAddress();
  setAddressAsCurrent(address);
  return publish();
}

module.exports.deploy = deploy;
