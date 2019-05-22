/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-LLL.(MIT)
 * */

/** imports */
const vscode = require("vscode")
const settings = require("./settings")


const mod_deco = require("./features/deco.js")
const mod_hover = require("./features/hover/hover.js")
const mod_compile = require("./features/compile.js")


/** global vars */
const builtIns = "timestamp|calldataload||returndatasize|revert|gasprice|div|shl|push3|jump|create2|sload|mul|jumpi|difficulty|address|byte|addmod|swap6|swap7|swap4|swap5|swap2|swap3|swap1|calldatacopy|swap8|swap9|dup15|dup14|dup16|dup11|dup10|dup13|dup12|or|mstore8|origin|gaslimit|number|pop|swap10|swap11|swap12|swap13|swap14|swap15|swap16|extcodesize|create|lt|pc|call|codecopy|sstore|signextend|sha3|gas|msize|extcodecopy|returndatacopy|slt|caller|codesize|balance|and|extcodehash|sar|return|mload|mstore|callvalue|selfdestruct|stop|calldatasize|mulmod|delegatecall|callcode"


var activeEditor;

/** classdecs */


/** funcdecs */


/** event funcs */
async function onDidSave(document){
    return new Promise((reject,resolve) =>{

        if(document.languageId!=settings.LANG_ID){
            console.log("langid mismatch")
            reject("langid_mismatch")
            return;
        }

        //always run on save
        
        if(settings.CONFIG.compile.onSave){
            resolve(mod_compile.compileContractCommand(document.uri))
        }
    })
}

async function onDidChange(event) {
    return new Promise((reject,resolve) => {
        if(vscode.window.activeTextEditor.document.languageId != settings.LANG_ID){
            reject("langid_mismatch")
            return;
        }

        console.log("onDidChange ...")
        if(settings.CONFIG.decoration.enable){
            mod_deco.decorateWords(activeEditor, [
                {
                    regex:"\\b(log\d*)\\.",
                    captureGroup: 1,
                }
            ], mod_deco.styles.foreGroundNewEmit);
        }
        

        console.log("✓ onDidChange")
        resolve()
    });
}
function onInitModules(context, type) {
    mod_hover.init(context, type, settings.CONFIG)
    mod_compile.init(context, type, settings.CONFIG)
}

function onActivate(context) {

    const active = vscode.window.activeTextEditor;
    if (!active || !active.document) return;
    activeEditor = active;

    console.debug(" activate extension: LLL....")

    registerDocType(settings.LANG_ID);
    
    function registerDocType(type) {
        context.subscriptions.push(
            vscode.languages.reg
        )

        // taken from: https://github.com/Microsoft/vscode/blob/master/extensions/python/src/pythonMain.ts ; slightly modified
        // autoindent while typing
        vscode.languages.setLanguageConfiguration(type, {
            onEnterRules: [
                {
                    beforeText: /^\s*\((?:seq|def|seq|when|returnlll|function).*?\s*$/,
                    action: { indentAction: vscode.IndentAction.Indent }
                }
            ]
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('LLL.compileContract', mod_compile.compileContractCommand)
        )
        
        if(!settings.CONFIG.mode.active){
            console.debug("ⓘ activate extension: entering passive mode. not registering any active code augmentation support.")
            return;
        }
        /** module init */
        onInitModules(context, type);
        onDidChange()
        onDidSave(active.document)

        /** event setup */
        /***** OnChange */
        vscode.window.onDidChangeActiveTextEditor(editor => {
            activeEditor = editor;
            if (editor) {
                onDidChange();
            }
        }, null, context.subscriptions);
        /***** OnChange */
        vscode.workspace.onDidChangeTextDocument(event => {
            if (activeEditor && event.document === activeEditor.document) {
                onDidChange(event);
            }
        }, null, context.subscriptions);
        /***** OnSave */

        vscode.workspace.onDidSaveTextDocument(document => {
            onDidSave(document);  
        }, null, context.subscriptions);
        

        


    }
    console.log("✓ activate extension: LLL")
}

/* exports */
exports.activate = onActivate;