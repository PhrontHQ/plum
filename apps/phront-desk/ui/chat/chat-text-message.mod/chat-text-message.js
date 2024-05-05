
// "use strict";
var Component = require("mod/ui/component").Component,
    DataEditor = require("mod/ui/data-editor").DataEditor;



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
