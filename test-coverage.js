const childprocess = require("child_process");
const istanbul = require("istanbul");
const Builder = require("selenium-webdriver").Builder;
const By = require("selenium-webdriver").By;
const until = require("selenium-webdriver").until;
const Chrome = require("./node_modules/selenium-webdriver/chrome");
const path = require("path");
const fs = require("fs");
const os = require("os");
require("chromedriver");

var excludeFiles = new Array();

var remoteURL, reportPathShow;
if (os.type() == "Windows_NT") {
    remoteURL = "http://localhost:8080\\test\\coverage-index.html";
    reportPathShow = ".\\coverage";
    excludeFiles.push("\\src\\nn\\wasm\\nn_ops.js");
} else {
    remoteURL = "http://localhost:8080/test/coverage-index.html";
    reportPathShow = "./coverage";
    excludeFiles.push("/src/nn/wasm/nn_ops.js");
}

var testBackend = new Array();
testBackend.push("wasm");
testBackend.push("webgl");

var arrayJSON = new Array();

if (!fs.existsSync(reportPathShow)) {
    fs.mkdirSync(reportPathShow);
}

var deleteDir = function (targetPath, flag) {
    let files = [];

    if (fs.existsSync(targetPath)) {
        files = fs.readdirSync(targetPath);

        files.forEach((file, index) => {
            let curPath = path.resolve(targetPath, file);

            if (fs.statSync(curPath).isDirectory()) {
                deleteDir(curPath, true);
            } else {
                fs.unlinkSync(curPath);
            }
        });
    }

    if (flag) {
        fs.rmdirSync(targetPath);
    }
}

var excludeHandler = function (sourceJSON) {
    let tmpJSON = new Object();

    for (let [key, value] of Object.entries(sourceJSON)) {
        let flag = false;

        for (let file of excludeFiles) {
            if (key.search(file) !== -1) {
                flag = true;
            }
        }

        if (flag) {
            console.log("exclude file: " + key);
        } else {
            tmpJSON[key] = value;
        }
    }

    return tmpJSON;
}

var integrationJSON = function (arrayJSON) {
    var integrationObject = new Object();

    for (let [keyLevel1, valueLevel1] of Object.entries(arrayJSON[0])) {
        let objectLevel2 = new Object();

        for (let [keyLevel2, valueLevel2] of Object.entries(valueLevel1)) {
            if (keyLevel2 == "path" || keyLevel2 == "statementMap" ||
                keyLevel2 == "fnMap" || keyLevel2 == "branchMap" ||
                keyLevel2 == "_coverageSchema" || keyLevel2 == "hash") {
                objectLevel2[keyLevel2] = valueLevel2;
            } else if (keyLevel2 == "s" || keyLevel2 == "f" || keyLevel2 == "l") {
                let objectLevel3 = new Object();

                for (let [keyLevel3, valueLevel3] of Object.entries(valueLevel2)) {
                    let tempValue = 0;

                    for (let backendJSON of arrayJSON) {
                        tempValue = tempValue + backendJSON[keyLevel1][keyLevel2][keyLevel3];
                    }

                    objectLevel3[keyLevel3] = tempValue;
                }

                objectLevel2[keyLevel2] = objectLevel3;
            } else if (keyLevel2 == "b") {
                let objectLevel3 = new Object();

                for (let [keyLevel3, valueLevel3] of Object.entries(valueLevel2)) {
                    let tempValue = new Array();

                    for (let count in valueLevel3) {
                        let countNumber = 0;

                        for (let backendJSON of arrayJSON) {
                            countNumber = countNumber + backendJSON[keyLevel1][keyLevel2][keyLevel3][count];
                        }

                        tempValue.push(countNumber);
                    }

                    objectLevel3[keyLevel3] = tempValue;
                }

                objectLevel2[keyLevel2] = objectLevel3;
            }
        }

        integrationObject[keyLevel1] = objectLevel2;
    }

    return integrationObject;
}

var generateReport = function (sourceJSON, targetPath, showReport) {
    let reporter, collector;
    let reporterConfig = istanbul.config.loadFile();
    let reporterSync = true;

    deleteDir(targetPath, false);

    reporter = new istanbul.Reporter(reporterConfig, targetPath);
    collector = new istanbul.Collector();

    collector.add(sourceJSON);

    if (showReport) {
        reporter.add("text");
    }

    reporter.addAll(["lcov", "json"]);
    reporter.write(collector, reporterSync, function() {
        console.log("Report generated in '" + targetPath + "'");
    });
}

var driver, chromeOption, testURL, webmlpolyfillHost;
(async function() {
    console.log("webml-polyfill web host is start");

    if (os.type() == "Windows_NT") {
        webmlpolyfillHost = childprocess.spawn("node", [".\\node_modules\\webpack-dev-server\\bin\\webpack-dev-server.js"], {stdio: "inherit"});
    } else {
        webmlpolyfillHost = childprocess.spawn("./node_modules/webpack-dev-server/bin/webpack-dev-server.js", {stdio: "inherit"});
    }

    webmlpolyfillHost.on("close", function(code, signal) {
        console.log("process webmlpolyfillHost terminated due to receipt of signal");
    });

    console.log("coverage report is start");

    for (let backend of testBackend) {
        chromeOption = new Chrome.Options();
        testURL = remoteURL + "?backend=" + backend;

        chromeOption = chromeOption
            .addArguments("--disable-features=WebML")
            .addArguments("--no-sandbox");

        driver = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(chromeOption)
            .build();

        await driver.sleep(5000);
        await driver.get(testURL);
        await driver.wait(until.elementLocated(By.xpath("//*[@id='mocha-stats']/li[1]/canvas")), 100000).then(function() {
            console.log("open remote URL: " + testURL);
        }).catch(function() {
            throw new Error("failed to load web page: " + testURL);
        });

        await driver.wait(async function() {
            return driver.executeScript("return window.mochaFinish;").catch(function(err) {
                throw err;
            });
        }, 200000).then(async function() {
            console.log("test with " + backend + " is completed");

            await driver.executeScript("return window.__coverage__;").then(function(json) {
                if (json !== null) {
                    let jsonTemp = excludeHandler(json);
                    arrayJSON.push(jsonTemp);
                } else {
                    throw new Error("'window.__coverage__' is undefined");
                }
            }).catch(function(err) {
                throw err;
            });
        }).catch(function(err) {
            throw err;
        });

        await driver.quit();
    }

    // Generate coverage test repoert with all backends
    var allSourceJSON = integrationJSON(arrayJSON);
    await generateReport(allSourceJSON, reportPathShow, true);

    webmlpolyfillHost.kill("SIGTERM");
})().then(function() {
    console.log("Coverage test completed!");
    process.exit(0);
}).catch(function(err) {
    console.log("Error: " + err);
    process.exit(1);
});