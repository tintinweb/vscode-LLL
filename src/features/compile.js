'use strict'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */
const vscode = require("vscode")
const path = require("path");
const exec = require("child_process").exec;
const async = require("async");
const mod_analyze = require("./analyze.js")
const shellescape = require('shell-escape');

const settings = require("../settings");

var extensionContext;
var compiler = {
    name: settings.LANGUAGE_ID,
    version: null
}

const compile = {};
var diagnosticCollections = {
    compiler:null,
    mythx:null
}

compile.display = function(paths, options) {
    if (options.quiet !== true) {
        if (!Array.isArray(paths)) {
            paths = Object.keys(paths);
        }

        paths.sort().forEach(contract => {
            if (path.isAbsolute(contract)) {
                contract =
                    "." + path.sep + path.relative(options.working_directory, contract);
            }
            options.logger.log("> Compiling " + contract);
        });
    }
};

// Check that LLL is available, save its version
function checkLLL(callback) {
    if(compiler.version){
        // version check already performed
        callback(null)
        return 
    }
    //allow anything as command - no shellescape to even allow python -m LLL --version etc...
    exec(`${settings.extensionConfig().command} --version`, function(err, stdout, stderr) {
        if (err){
            return callback(`Error executing lll:\n${stderr}`);
        }
            

        let rx = /^Version\:(.*)$/gm;
        compiler.version = rx.exec(stdout.trim())[1].trim();
        
        callback(null);
    });
}

// Execute LLL for single source file
function execLLL(source_path, callback) {
    const command = `${settings.extensionConfig().command} --hex ${shellescape([source_path])}`;

    exec(command, function(err, stdout, stderr) {
        if (err)
            return callback(
                `${stderr}\nCompilation of ${source_path} failed. See above.`
            );
        var compiled_contract = stdout.trim();


        callback(null, compiled_contract);
    });
}

// compile all options.paths
function compileAll(options, callback) {
    options.logger = options.logger || console;

    compile.display(options.paths, options);
    async.map(
        options.paths,
        function(source_path, c) {
            execLLL(source_path, function(err, compiled_contract) {
                if (err) return c(err);
                // remove first extension from filename
                const extension = path.extname(source_path);
                const basename = path.basename(source_path, extension);

                // if extension is .py, remove second extension from filename
                const contract_name = basename

                const contract_definition = {
                    contract_name: contract_name,
                    sourcePath: source_path,

                    bytecode: compiled_contract,

                    compiler: compiler
                };

                c(null, contract_definition);
            });
        },
        function(err, contracts) {
            if (err) return callback(err);

            const result = contracts.reduce(function(result, contract) {
                result[contract.contract_name] = contract;

                return result;
            }, {});

            const compilerInfo = {
                name: settings.LANGUAGE_ID,
                version: compiler.version
            };

            callback(null, result, options.paths, compilerInfo);
        }
    );
}

// Check that LLL is available then forward to internal compile function
function compileLLL(options, callback) {
    // filter out non-LLL paths


    // no LLL files found, no need to check LLL
    if (options.paths.length === 0) return callback(null, {}, []);

    checkLLL(function(err) {
        if (err) return callback(err);

        return compileAll(options, callback);
    });
}


function compileActiveFileCommand(contractFile) {
    compileActiveFile(contractFile)
        .then(
            (success) => {
                diagnosticCollections.compiler.delete(contractFile);
                diagnosticCollections.mythx.delete(contractFile);
                vscode.window.showInformationMessage('[Compiler success] ' + Object.keys(success).join(","))
                
                // precedence: (1) settings.extensionConfig(). otherwise (2) process.env 
                let password = settings.extensionConfig().analysis.mythx.password || process.env.MYTHX_PASSWORD
                let ethAddress = settings.extensionConfig().analysis.mythx.ethAddress || process.env.MYTHX_ETH_ADDRESS

                //set to trial?
                if(ethAddress=="trial"){
                    ethAddress = "0x0000000000000000000000000000000000000000"
                    password = "trial"
                }

                //not set and never asked
                if(ethAddress == "initial"){
                    if (typeof extensionContext.globalState.get("LLL.mythx.account.trial") === "undefined"){
                        vscode.window.showInformationMessage('[MythX ] Enable MythX security analysis trial mode?', "Free Trial", "Tell me more!", "No, Thanks!")
                            .then(choice => {
                                if(choice=="Free Trial"){
                                    extensionContext.globalState.update("LLL.mythx.account.trial","useTrial")
                                    return compileActiveFileCommand(contractFile)
                                } else if(choice=="Tell me more!"){
                                    vscode.env.openExternal(vscode.Uri.parse("https://www.mythx.io/#faq"))
                                } else {
                                    extensionContext.globalState.update("LLL.mythx.account.trial","noAsk")
                                }
                            })
                        }
                    if(extensionContext.globalState.get("LLL.mythx.account.trial") && extensionContext.globalState.get("LLL.mythx.account.trial")=="useTrial"){
                        ethAddress = "0x0000000000000000000000000000000000000000"
                        password = "trial"
                    }
                }

                if(settings.extensionConfig().analysis.onSave && ethAddress && password){
                    //if mythx is configured
                    
                    // bytecode
                    for (let contractKey in success) {
                        mod_analyze.analyze.mythXjs(ethAddress, password, success[contractKey].bytecode, success[contractKey].deployedBytecode)
                        .then(result => {
                            let diagIssues = []

                            result.forEach(function(_result){
                                _result.issues.forEach(function(issue){
                                    let locations = JSON.stringify(issue.locations)
                                    let shortmsg = `[${issue.severity}] ${issue.swcID}: ${issue.description.head}`
                                    let errormsg = `[${issue.severity}] ${issue.swcID}: ${issue.swcTitle}\n${issue.description.head}\n${issue.description.tail}\n\nLocations (bytecode offset): ${locations}\n\nCovered Instructions/Paths: ${_result.meta.coveredInstructions}/${_result.meta.coveredPaths}`
                                    let lineNr = 1  // we did not submit any source so just pin it to line 0

                                    diagIssues.push({
                                        code: '',
                                        message: shortmsg,
                                        range: new vscode.Range(new vscode.Position(lineNr - 1, 0), new vscode.Position(lineNr - 1, 255)),
                                        severity: mod_analyze.mythXSeverityToVSCodeSeverity[issue.severity],
                                        source: errormsg,
                                        relatedInformation: []
                                    });
                                })
                            })
                            vscode.window.showInformationMessage(`[MythX success] ${contractKey}: ${diagIssues.length} issues`);
                            diagnosticCollections.mythx.set(contractFile, diagIssues);
                        }).catch(err => {
                            vscode.window.showErrorMessage('[MythX error] ' + err)
                            console.log(err)
                        })
                    }
                    
                }
            },
            (errormsg) => {
                diagnosticCollections.compiler.delete(contractFile);
                diagnosticCollections.mythx.delete(contractFile);
                vscode.window.showErrorMessage('[Compiler Error] ' + errormsg);
                let lineNr = 1; // add default errors to line 0 if not known
                let matches = /(?:line\s+(\d+))/gm.exec(errormsg)
                if (matches && matches.length==2){
                    //only one line ref
                    lineNr = parseInt(matches[1])
                }

                let lines = errormsg.split(/\r?\n/)
                console.log(errormsg)
                let shortmsg = lines[0]

                // IndexError
                if (lines.indexOf("SyntaxError: invalid syntax") > -1) {
                    let matches = /line (\d+)/gm.exec(errormsg)
                    if (matches.length >= 2) {
                        lineNr = parseInt(matches[1])
                    }
                    shortmsg = "SyntaxError: invalid syntax";
                } else {
                    //match generic LLL exceptions
                    let matches = /LLL\.exceptions\.\w+Exception:\s+(?:line\s+(\d+)).*$/gm.exec(errormsg)
                    if (matches && matches.length > 0) {
                        shortmsg = matches[0]
                        if (matches.length >= 2) {
                            lineNr = parseInt(matches[1])
                        }
                    }


                }
                if (errormsg) {
                    diagnosticCollections.compiler.set(contractFile, [{
                        code: '',
                        message: shortmsg,
                        range: new vscode.Range(new vscode.Position(lineNr - 1, 0), new vscode.Position(lineNr - 1, 255)),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: errormsg,
                        relatedInformation: []
                    }]);
                }
            }
        )
        .catch(ex => {
            vscode.window.showErrorMessage('[Compiler Exception] ' + ex)
            console.error(ex)
        })
}

function compileActiveFile(contractFile) {
    return new Promise((resolve, reject) => {
        if (!contractFile && vscode.window.activeTextEditor.document.languageId !== settings.LANGUAGE_ID) {
            reject("Not a LLL source file")
            return;
        }
        let options = {
            contractsDirectory: "./contracts",
            working_directory: "",
            all: true,
            paths: [typeof contractFile == "undefined" ? vscode.window.activeTextEditor.document.uri.path : contractFile.path]
        }

        compileLLL(options, function(err, result, paths, compilerInfo) {
            if (err) {
                reject(err)
            } else {
                resolve(result, paths, compilerInfo)
            }
        })
    })
}

function init(context) {
    diagnosticCollections.compiler = vscode.languages.createDiagnosticCollection('LLL Compiler');
    context.subscriptions.push(diagnosticCollections.compiler)
    diagnosticCollections.mythx = vscode.languages.createDiagnosticCollection('MythX Security Platform');
    context.subscriptions.push(diagnosticCollections.mythx)
    extensionContext = context
}

module.exports = {
    init: init,
    compileContractCommand: compileActiveFileCommand,
    compileContract: compileActiveFile
}
