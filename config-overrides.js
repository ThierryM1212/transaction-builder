const path = require('path');
const {overrideDevServer} = require("customize-cra");

const devServerConfig = () => config => {
  return {
     ...config,
     // webpackDevService doesn't write the files to desk
     // so we need to tell it to do so so we can load the
     // extension with chrome
     writeToDisk: true
  }
}

module.exports = function override(config, env) {
  const wasmExtensionRegExp = /\.wasm$/;

  config.resolve.extensions.push('.wasm');

  config.module.rules.forEach(rule => {
    (rule.oneOf || []).forEach(oneOf => {
      if (oneOf.loader && oneOf.loader.indexOf('file-loader') >= 0) {
        // make file-loader ignore WASM files
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });

  // add a dedicated loader for WASM
  config.module.rules.push({
    test: wasmExtensionRegExp,
    include: path.resolve(__dirname, 'src'),
    use: [{ loader: require.resolve('wasm-loader'), options: {} }]
  });

  return config;
};

module.exports["devServer"] = overrideDevServer(devServerConfig());
