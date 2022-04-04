'use strict';


/*
  REMOVE ME: mr needs to be able to load node native modules
*/
global.crypto = require('crypto');

var Montage = require('montage/montage');
var PATH = require("path");

// //From Montage
// Load package
Montage.loadPackage(PATH.join(__dirname, "."), {
  mainPackageLocation: PATH.join(__filename, ".")
})
.then(function (mr) {
  return mr.async("./main");
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


