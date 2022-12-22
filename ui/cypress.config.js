const { defineConfig } = require("cypress");
const execa = require("execa");

// supporting macOS and linux
const getPluginPathBasedOnOS = () => {
  let pathPrefix = process.platform == "linux" ? `${process.env.PWD}/` : "";
  let pathSuffix = "cypress/plugins/Wallets/Sui-Wallet";
  // let extraSuffix = process.platform == "linux" ? "/Sui-Wallet" : "";

  return pathPrefix + pathSuffix;
};

const findBrowser = () => {
  // the path is hard-coded for simplicity.
  const os = process.platform;
  // Skipping for non macOS systems
  if (os != "darwin") return Promise.resolve(null);

  const browserPath =
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
  return execa(browserPath, ["--version"]).then((result) => {
    // STDOUT will be like "Brave Browser 77.0.69.135"
    const [, version] = /Brave Browser (\d+\.\d+\.\d+\.\d+)/.exec(
      result.stdout
    );
    const majorVersion = parseInt(version.split(".")[0]);

    return {
      name: "Brave",
      channel: "stable",
      family: "chromium",
      displayName: "Brave",
      version,
      path: browserPath,
      majorVersion,
    };
  });
};

module.exports = defineConfig({
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    chromeWebSecurity: false,
  },
  e2e: {
    setupNodeEvents(on, config) {
      on(
        "before:browser:launch",
        (browser = { isHeaded: true }, launchOptions) => {
          // Download your wallet extension and move the unzipped folder under cypress/plugins/Wallets/
          // Use: https://chrome.google.com/webstore/detail/crx-extractordownloader/ajkhmmldknmfjnmeedkbkkojgobmljda
          launchOptions.extensions.push(getPluginPathBasedOnOS());

          return launchOptions;
        }
      );
      return findBrowser().then((browser) => {
        if (browser) {
          return {
            browsers: config.browsers.concat(browser),
          };
        }
      });
    },
  },
});
