const childprocess = require("child_process");

(async function() {
    let commands;
    commands = "NODE_ENV=coverage npm start";
    childprocess.exec(commands, function (err, stdout, stderr) {
        if (err != null) {
            console.log("command fail, error message : ", err);
            process.exit(1);
        }
    });
})().then(function() {
    console.log("Test completed!");
}).catch(function(err) {
    console.log("Error: " + err);
});