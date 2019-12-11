'use strict'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * 
 * */
/** imports */
const vscode = require("vscode");

/** globals */
const LANGUAGE_ID = "LLL";

function extensionConfig() {
    return vscode.workspace.getConfiguration(LANGUAGE_ID);
}

module.exports = {
    LANGUAGE_ID: LANGUAGE_ID,
    extensionConfig: extensionConfig
}