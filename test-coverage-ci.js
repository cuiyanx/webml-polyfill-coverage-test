const childprocess = require("child_process");

(async function() {
    var commands;
    commands = "NODE_ENV=coverage npm start";

    var webml = childprocess.exec(commands, function (err, stdout, stderr) {
        if (err != null) {
            console.log("command fail, error message : ", err);
            process.exit(1);
        }
    });

    commands = "cd test/tools/CoverageManager/ && npm install && npm start";

    childprocess.execSync(commands, {stdio: "inherit"});
})().then(function() {
    console.log("Coverage test completed!");
    process.exit(0);
}).catch(function(err) {
    console.log("Error: " + err);
    process.exit(1);
});