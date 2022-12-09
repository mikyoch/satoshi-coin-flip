const { defineConfig } = require("cypress");
const execa = require('execa')

const findBrowser = () => {
  // the path is hard-coded for simplicity
  const browserPath =
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

  return execa(browserPath, ['--version']).then((result) => {
    // STDOUT will be like "Brave Browser 77.0.69.135"
    const [, version] = /Brave Browser (\d+\.\d+\.\d+\.\d+)/.exec(result.stdout)
    const majorVersion = parseInt(version.split('.')[0])

    return {
      name: 'Brave',
      channel: 'stable',
      family: 'chromium',
      displayName: 'Brave',
      version,
      path: browserPath,
      majorVersion,
    }
  })
}

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
      on('before:browser:launch', (browser = { isHeaded: true }, launchOptions) => {
        // Download your wallet extension and move the unzipped folder under cypress/plugins/Wallets/ 
        // Use: https://chrome.google.com/webstore/detail/crx-extractordownloader/ajkhmmldknmfjnmeedkbkkojgobmljda
        launchOptions.extensions.push('cypress/plugins/Wallets/Sui-Wallet')

        return launchOptions
      })
      return findBrowser().then((browser) => {
        return {
          browsers: config.browsers.concat(browser),
        }
      })
    }
  }
})
