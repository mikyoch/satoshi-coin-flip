const { execSync } = require("child_process");
const fs = require("fs");

const envUIScheme = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "",
};

const defaultUIEnvValues = {
  NEXT_PUBLIC_PACKAGE: "",
  NEXT_PUBLIC_API_BASE_URL: "http://localhost:8080",
};
