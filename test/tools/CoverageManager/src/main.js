const istanbul = require("istanbul");
const Builder = require("../node_modules/selenium-webdriver").Builder;
const By = require("../node_modules/selenium-webdriver").By;
const until = require("../node_modules/selenium-webdriver").until;
const Chrome = require("../node_modules/selenium-webdriver/chrome");
const path = require("path");
const fs = require("fs");
require("chromedriver");

var rootPath = path.resolve(__dirname, "..");

var configCM = JSON.parse(fs.readFileSync(path.resolve(rootPath, "config.json")));
var webmlpolyfillCommit = configCM.webmlpolyfill.commit;
var webmlpolyfillPath = configCM.webmlpolyfill.path;
var remoteURL = configCM.remoteURL;
var browser = configCM.browser;

var testBackend = new Array();
testBackend.push("wasm");
testBackend.push("webgl");

var excludeFiles = new Array();
excludeFiles.push("/src/nn/wasm/nn_ops.js");

var arrayJSON = new Array();

var reportTreePath = path.resolve(rootPath, "report-tree");
var reportPathVersion = path.resolve(reportTreePath, webmlpolyfillCommit);
var reportPathAll = path.resolve(reportPathVersion, "all");
var reportPathShow = path.resolve(rootPath, "coverage");

if (!fs.existsSync(reportTreePath)) {
    fs.mkdirSync(reportTreePath);
}

if (!fs.existsSync(reportPathVersion)) {
    fs.mkdirSync(reportPathVersion);
}

if (!fs.existsSync(reportPathAll)) {
    fs.mkdirSync(reportPathAll);
}

if (!fs.existsSync(reportPathShow)) {
    fs.mkdirSync(reportPathShow);
}

for (let backend of testBackend) {
    if (!fs.existsSync(path.resolve(reportPathVersion, backend))) {
        fs.mkdirSync(path.resolve(reportPathVersion, backend));
    }
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

var relocationSRC = function (sourceJSON) {
    let tmpJSON = new Object();

    if (webmlpolyfillPath !== "default") {
        let pathArray = webmlpolyfillPath.split("/");
        let objectPath = rootPath;

        for (let pathName of pathArray) {
            objectPath = path.resolve(objectPath, pathName);
        }

        for (let [keyLevel1, valueLevel1] of Object.entries(sourceJSON)) {
            let objectLevel2 = new Object();

            for (let [keyLevel2, valueLevel2] of Object.entries(valueLevel1)) {
                if (keyLevel2 == "path") {
                    let tmpPath = objectPath + valueLevel2.slice(valueLevel2.search("/src/"));
                    objectLevel2[keyLevel2] = tmpPath;

//                    console.log("path: " + tmpPath);
                } else {
                    objectLevel2[keyLevel2] = valueLevel2;
                }
            }

            let tmpKey = objectPath + keyLevel1.slice(keyLevel1.search("/src/"));
            tmpJSON[tmpKey] = objectLevel2;

//            console.log("key: " + tmpKey);
        }

        return tmpJSON;
    } else {
        return sourceJSON;
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

var driver, chromeOption, testURL;
(async function() {
    console.log("coverage report is start");

    for (let backend of testBackend) {
        chromeOption = new Chrome.Options();
        testURL = remoteURL + "?backend=" + backend;

        chromeOption = chromeOption
            .setChromeBinaryPath(browser)
            .addArguments("--disable-features=WebML")
//            .addArguments("--headless")
            .addArguments("--no-sandbox");

        driver = new Builder()
            .forBrowser("chrome")
            .setChromeOptions(chromeOption)
            .build();

        await driver.get(testURL);
        await driver.wait(until.elementLocated(By.xpath("//*[@id='mocha-stats']/li[1]/canvas")), 100000).then(function() {
            console.log("open remote URL: " + testURL);
        }).catch(function() {
            throw new Error("failed to load web page");
        });

        await driver.wait(async function() {
            return driver.executeScript("return window.mochaFinish;").catch(function(err) {
                throw err;
            });
        }, 200000).then(async function() {
            console.log("test with " + backend + " is completed");

            await driver.executeScript("return window.__coverage__;").then(function(json) {
                if (json !== null) {
                    // Generate coverage test repoert with backend
                    let jsonTemp = relocationSRC(json);
                    jsonTemp = excludeHandler(jsonTemp);
                    arrayJSON.push(jsonTemp);
                    generateReport(jsonTemp, path.resolve(reportPathVersion, backend), false);
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
    generateReport(allSourceJSON, reportPathAll, false);
    generateReport(allSourceJSON, reportPathShow, true);
/*
    driver = new Builder()
        .forBrowser("chrome")
        .setChromeOptions(new Chrome.Options().setChromeBinaryPath(browser))
        .build();

    await driver.get("file://" + path.resolve(reportPathShow, "lcov-report", "index.html"));
*/
})().then(function() {
    console.log("coverage report is completed");
}).catch(function(err) {
    console.log(err);

    driver.quit();
    process.exit(1);
});
