
"use strict";
var Component = require("montage/ui/component").Component,
    DataEditor = require("montage/ui/data-editor").DataEditor;



exports.ChatTextMessage = DataEditor.specialize({
    constructor: {
        value: function ChatTextMessage () {
            this.super();
            return this;
        }
    },
    _blocksOwnerComponentDraw: {
        value: false
    }

});
