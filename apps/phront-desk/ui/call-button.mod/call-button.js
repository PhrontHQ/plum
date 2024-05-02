"use strict";
var Component = require("montage/ui/component").Component;

exports.CallButton = Component.specialize({

    handlePress: {
        value: function (event) {
            window.open("tel: +" + this.phoneNumber.countryCode + this.phoneNumber.nationalNumber, "_system");
        }
    }

});
