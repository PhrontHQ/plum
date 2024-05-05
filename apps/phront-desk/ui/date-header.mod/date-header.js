/**
 * @module ui/categories.mod
 * @requires mod/ui/component
 */
var DataEditor = require("mod/ui/data-editor").DataEditor;

/**
 * @class Categories
 * @extends Component
 */
//TODO choose a name for categories component
exports.DateHeader = DataEditor.specialize(/** @lends Categories# */ {

    constructor: {
        value: function DateHeader() {
            this.super();
            return this;
        }
    }
    //,
    // readExpressions: {
    //     value:[
    //         "event"
    //     ]
    // },
    // dataDidChange: {
    //     value: function () {
    //         this.dataService.getObjectProperties(value,["event"])
    //         .then(()=>{
    //             this.canDrawGate.setField("dataLoaded", true);
    //         });    
    //     }
    // }
    
});
