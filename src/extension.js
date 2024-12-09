'use strict'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * language definition based on: https://raw.githubusercontent.com/Microsoft/vscode/master/extensions/python/syntaxes/MagicPython.tmLanguage.json (MIT)
 * compilation related parts taken from: https://github.com/trufflesuite/truffle/tree/develop/packages/truffle-compile-LLL.(MIT)
 * */

/** imports */
const vscode = require("vscode");
const settings = require("./settings");


const mod_deco = require("./features/deco.js");
const mod_hover = require("./features/hover/hover.js");
const mod_compile = require("./features/compile.js");


/** global vars */
const builtIns = "timestamp|calldataload||returndatasize|revert|gasprice|div|shl|push3|jump|create2|sload|mul|jumpi|difficulty|address|byte|addmod|swap6|swap7|swap4|swap5|swap2|swap3|swap1|calldatacopy|swap8|swap9|dup15|dup14|dup16|dup11|dup10|dup13|dup12|or|mstore8|origin|gaslimit|number|pop|swap10|swap11|swap12|swap13|swap14|swap15|swap16|extcodesize|create|lt|pc|call|codecopy|sstore|signextend|sha3|gas|msize|extcodecopy|returndatacopy|slt|caller|codesize|balance|and|extcodehash|sar|return|mload|mstore|callvalue|selfdestruct|stop|calldatasize|mulmod|delegatecall|callcode"


var activeEditor;

/** classdecs */


/** funcdecs */


/** event funcs */
async function onDidSave(document) {

    if (document.languageId != settings.LANGUAGE_ID) {
        return;
    }

    //always run on save
    if (settings.extensionConfig().compile.onSave) {
        mod_compile.compileContractCommand(document.uri)
    }
}

async function onDidChange(event) {
    if (vscode.window.activeTextEditor.document.languageId != settings.LANGUAGE_ID) {
        return;
    }
    if (settings.extensionConfig().decoration.enable) {
        mod_deco.decorateWords(activeEditor, [
            {
                regex: "\\b(log\d*)\\.",
                captureGroup: 1,
            }
        ], mod_deco.styles.foreGroundNewEmit);
    }
}
function onInitModules(context, type) {
    mod_hover.init(context, type);
    mod_compile.init(context, type);
}

function onActivate(context) {

    const active = vscode.window.activeTextEditor;
    if (!active || !active.document) return;
    activeEditor = active;

    registerDocType(settings.LANGUAGE_ID);

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
            vscode.commands.registerCommand('LLL.compileContract', (docuri) => { return mod_compile.compileContractCommand(docuri ?? active.document.uri) })
        )

        if (!settings.extensionConfig().mode.active) {
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

        /****** OnOpen */
        vscode.workspace.onDidOpenTextDocument(document => {
            onDidSave(document);
        }, null, context.subscriptions);
    }
}

/* exports */
exports.activate = onActivate;