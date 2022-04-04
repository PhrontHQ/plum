
"use strict";
var Component = require("montage/ui/component").Component,
    DataEditor = require("montage/ui/data-editor").DataEditor;



exports.CallPracticeMessage = DataEditor.specialize({
    constructor: {
        value: function CallPracticeMessage () {
            this.super();
            return this;
        }
    }

});
