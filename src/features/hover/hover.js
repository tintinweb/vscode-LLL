'use strict'
/** 
 * @author github.com/tintinweb
 * @license MIT
 * 
 * */
const vscode = require('vscode');
const settings = require("../../settings");
const { ASM } = require("./static.asm.js");

function createHover(name, snippet, type) {
    var text = Array();

    if (isSet(snippet.instr_args) || isSet(snippet.instr_returns)) {
        text.push("_asm_ :: __" + name + "__ (" + snippet.instr_args.join(", ") + ")" + (isSet(snippet.instr_returns) ? " : " + snippet.instr_returns.join(", ") : ""))
    }

    if (text.length > 0) text.push("")
    if (isSet(snippet.instr_gas)) {
        text.push("__⟶__ gas (min): " + snippet.instr_gas)
    }
    if (isSet(snippet.instr_fork)) {
        text.push("__⟶__ since: " + snippet.instr_fork)
    }

    if (text.length > 0) text.push("")
    if (isSet(snippet.example)) {
        text.push(snippet.example)
    }

    if (text.length > 0) text.push("")
    if (isSet(snippet.description)) {
        var txt_descr = snippet.description instanceof Array ? snippet.description.join("\n ") : snippet.description;
        text.push("💡 " + txt_descr)
    }

    if (text.length > 0) text.push("")
    if (isSet(snippet.security)) {
        text.push("")
        var txt_security = snippet.security instanceof Array ? snippet.security.join("\n* ❗") : snippet.security;
        text.push("* ❗ " + txt_security)
    }

    if (text.length > 0) text.push("")
    if (isSet(snippet.reference)) {
        text.push("🌎 [more...](" + snippet.reference + ")")
    }

    //const commentCommandUri = vscode.Uri.parse(`command:editor.action.addCommentLine`);
    //text.push("[Add comment](${commentCommandUri})")
    const contents = new vscode.MarkdownString(text.join("  \n"));
    contents.isTrusted = true;
    return new vscode.Hover(contents);

    return new vscode.Hover({
        language: type,
        value: text.join("\n")
    });

    function isSet(val) {
        return typeof val != "undefined" && val != "";
    }
}

function provideHoverHandler(document, position, token, type) {
    if (!settings.extensionConfig().hover.enable) {
        return;
    }
    const range = document.getWordRangeAtPosition(position);
    if (range.length <= 0)
        return;
    const word = document.getText(range);

    for (const snippet in ASM) {
        if (
            ASM[snippet].prefix == word ||
            ASM[snippet].hover == word
        ) {
            return createHover(snippet, ASM[snippet], type);
        }
    }
}

function init(context, type) {
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(type, {
            provideHover(document, position, token) {
                return provideHoverHandler(document, position, token, type);
            }
        })
    );
}

module.exports = {
    init: init
}
