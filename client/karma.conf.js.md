The custom [karma config can be replaced with Vitest configuration](https://angular.dev/guide/testing/migrating-to-vitest#3-handle-custom-karmaconfjs-configurations). For the sake of simplicity at the moment,
I am just "commenting out" this config file by making it a markdown file. The main difference that I see is that
Chrome headless is used, but [the default for Vitest is headless anyways](https://angular.dev/guide/testing/migrating-to-vitest#5-configure-browser-mode-optional).

```js
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [require("karma-jasmine"), require("karma-chrome-launcher"), require("karma-jasmine-html-reporter"), require("karma-coverage")],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
    },
    coverageReporter: {
      dir: require("path").join(__dirname, "./coverage/client"),
      subdir: ".",
      reporters: [{ type: "html" }, { type: "lcovonly" }, { type: "text-summary" }],
      check: {
        emitWarning: false,
        global: {
          statements: 80,
          lines: 80,
          branches: 80,
          functions: 80,
        },
      },
    },
    reporters: ["progress", "kjhtml"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["Chrome"],
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    singleRun: false,
    restartOnFileChange: true,
  });
};
```
