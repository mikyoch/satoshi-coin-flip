const withReactSvg = require('next-react-svg')
const path = require('path')

/** @type {import('next').NextConfig} */

module.exports = withReactSvg({
  include: path.resolve(__dirname, 'public/svg'),
  webpack(config, options) {
    return config
  }
});
module.exports.reactStrictMode = true;
// module.exports.env = {
//   PACKAGE_ADDRESS: "0xa0ec2d97c19aa4c71c51ff4588b22bb1b216b01a",
//   API_URL: "http://satoshi-flip-api.satoshi-flip.svc.cluster.local:8080"
// }