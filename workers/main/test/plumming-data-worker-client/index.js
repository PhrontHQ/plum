'use strict';

var Montage = require('mod/mod');
var PATH = require("path");

// //From Montage
// Load package
Montage.loadPackage(PATH.join(__dirname, "."), {
  mainPackageLocation: PATH.join(__filename, ".")
})
.then(function (mr) {
  return mr.async('main');
},function rejected(rejected) {
    console.error(rejected);
});
// .then(function (module) {
//   module.promise.then(function(resolved) {
//     console.log(resolved);

//   }, function rejected(rejected) {
//     console.error(rejected);
//   });
// });


