
"use strict";
var Component = require("mod/ui/component").Component,
    DataEditor = require("mod/ui/data-editor").DataEditor;



exports.CallPracticeMessage = DataEditor.specialize({
    constructor: {
        value: function CallPracticeMessage () {
            this.super();
            return this;
        }
    }

});
