/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */

 /** imports */
const vscode = require("vscode")

/** globals */
const LANG_ID = "LLL";
const CONFIG = vscode.workspace.getConfiguration(LANG_ID);

module.exports = {
    LANG_ID:LANG_ID,
    CONFIG:CONFIG
}