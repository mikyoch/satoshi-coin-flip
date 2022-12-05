const { execSync } = require("child_process");
const fs = require("fs");
const { publishSatoshiPackage } = require("./deploy_contract");

const envAPIScheme = {
  PORT: "",
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  environment: "",
  trustedOriginsDev: "",
  trustedOriginsProd: "",
};

const defaultAPIEnvValues = {
  PORT: 8080,
  PRIVATE_KEY: "",
  BANKER_ADDRESS: "",
  PACKAGE_ADDRESS: "",
  environment: "dev",
  trustedOriginsDev: '["http://localhost:3000"]',
  trustedOriginsProd: '["https://satoshidomain.sui:3000"]',
};
