// An example configuration file.
// https://raw.github.com/angular/protractor/master/example/conf.js
exports.config = {
  // The address of a running selenium server.
  seleniumServerJar: './node_modules/selenium/lib/runner/selenium-server-standalone-2.20.0.jar',
  //seleniumAddress: 'http://localhost:4444/wd/hub',
  chromeDriver: './node_modules/chromedriver/lib/chromedriver/chromedriver',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome'
  },

  // URL of the app you want to test.
  baseUrl: 'http://localhost:1337',

  specs: [
    'tests/*.e2e.js'
  ],

  // Options to be passed to Jasmine-node.
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000
  }
};