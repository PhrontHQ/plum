/**
 * @module ui/plum-loader.reel
 */
var Loader = require("montage/ui/loader.reel").Loader;

/**
 * @class PlumLoader
 * @extends Component
 */
var PlumLoader = exports.PlumLoader = Loader.specialize(/** @lends PlumLoader# */ {


    hasTemplate: {
        value: true
    },

    minimumFirstLoadingDuration: {
        value: 800
    }

});
