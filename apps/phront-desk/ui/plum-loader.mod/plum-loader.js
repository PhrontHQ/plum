/**
 * @module ui/plum-loader.mod
 */
var Loader = require("montage/ui/loader.mod").Loader;

/**
 * @class PlumLoader
 * @extends Component
 */
var PlumLoader = exports.PlumLoader = Loader.specialize(/** @lends PlumLoader# */ {


    hasTemplate: {
        value: true
    },

    minimumFirstLoadingDuration: {
        value: 0
    }

});
