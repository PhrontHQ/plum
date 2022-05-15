const WebSocket = require('ws');
require('montage/core/extras/string');
const PATH = require("path");
const isDev = false;
var ws;
var timeoutBetweenOperations;
if(isDev) {
  ws = new WebSocket('ws://localhost:7373/');
  timeoutBetweenOperations = 0;
} else {
  ws = new WebSocket('wss://5fvrn782kl.execute-api.us-west-2.amazonaws.com/staging');
  //Local proxy of above:
  // ws = new WebSocket('wss://localhost:60103/');
  // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  timeoutBetweenOperations = 280;
}


//var transactionJSONFile = "mock-input-operations/tops-ortho-samples/transactions/transactions.json";
var transactionJSONFile = "mock-input-operations/tops-ortho-samples/transactions/liveExportTransaction-2/index.json";
var transactionJSONFileFullPath = PATH.join(__dirname, transactionJSONFile);
var transactionJSONFileDirectory = PATH.join(__dirname, transactionJSONFile.stringByDeletingLastPathComponent());

const fs = require('fs');
const Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
      MontageSerializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
      //module.path in pure node is module.directory in mr
      //module.filename in pure node is module.locaation in mr
      
      //transactionJSONData = fs.readFileSync(PATH.join(__dirname, transactionJSONFile), 'utf8'),
      transactionJSONData = fs.readFileSync(transactionJSONFileFullPath, 'utf8'),
      transactionModuleIds = JSON.parse(transactionJSONData),
      transactionModuleIdCount = transactionModuleIds.length;

      // packageJSONData = fs.readFileSync(PATH.join(__dirname, "mock-input-operations/tops-ortho-samples/operations.json"), 'utf8'),
      // operationModuleIds = JSON.parse(packageJSONData);

var pendingOperationById = new Map(),
    pendingTransactionPromiseFunctionsById = new Map(),
    transactionModuleIdIndex = 0,

    pendingOperationPromiseFunctionsById = new Map(),
    operationModuleIds,
    operationModuleIdIndex = 0,
    operationModuleIdCount = 0,
    operationModuleId,
    operationData,
    deserializer = new Deserializer(),
    serializer = new MontageSerializer().initWithRequire(require),
    inputOperationPromise,
    inputOperation,
    serializedInputOperation,
    serializedKeepAliveOperation = {
        "root" : {
            "values" : {
                "id" : "3E6F3D77-EDB1-47C3-AB38-B0ED127782AC",
                "type" : "keepAlive",
                "data" : null
            },
            "prototype" : "montage/data/service/data-operation"
        }
    },
    serializedKeepAliveOperationString = JSON.stringify(serializedKeepAliveOperation);

ws.on('open', function open() {
  processTransactionQueue();
});

function processTransactionQueue() {

  var inputTransactionPromise = new Promise(function(resolve,reject) {

    var transactionModuleId = transactionModuleIds[transactionModuleIdIndex],
      //Path should be relative to the json file:
        fullPath = PATH.join(transactionJSONFileDirectory, transactionModuleId),
        transactionData;

        if(fs.lstatSync(fullPath).isDirectory() ) {
            operationModuleIds = fs.readdirSync(fullPath).map(fileName => {
                return PATH.join(transactionModuleId, fileName);
            });
        } else {
          transactionData = fs.readFileSync(PATH.join(__dirname, transactionModuleId), 'utf8');
          operationModuleIds = JSON.parse(transactionData);
        }

        operationModuleIdCount = operationModuleIds.length;
        operationModuleIdIndex = 0;

      //pendingOperationById.set(inputOperationJSON.root.values.id, inputOperationJSON);

      pendingTransactionPromiseFunctionsById.set(transactionModuleIdIndex,[resolve,reject]);
      console.log("Processsing transaction: "+PATH.join(__dirname, transactionModuleId));
      processSendOperationQueue();
  
  });

  inputTransactionPromise.then(function() {

    //Cleanup before we move on to the next
    pendingTransactionPromiseFunctionsById.delete(transactionModuleIdIndex);

    transactionModuleIdIndex++;
    if(transactionModuleIdIndex < transactionModuleIdCount) {
      processTransactionQueue();
    } else {
      console.log("Competed processing of all transactions");
    }
  });

}


function processSendOperationQueue() {
  console.log("processSendOperationQueue()");

    var inputOperationPromise = new Promise(function(resolve,reject) {
      var operationModuleId = operationModuleIds[operationModuleIdIndex],
          //operationData = fs.readFileSync(PATH.join(__dirname, operationModuleId), 'utf8'),
         operationData = fs.readFileSync(PATH.join(transactionJSONFileDirectory, operationModuleId), 'utf8'),
      
        inputOperationJSON = JSON.parse(operationData);

      //var operationPromise = require.async(operationModuleId).then(function(value) {
        //inputOperation = value.montageObject;
    
        //pendingOperationById.set(inputOperation.id, inputOperation);
        pendingOperationById.set(inputOperationJSON.root.values.id, inputOperationJSON);
        //serializedInputOperation = serializer.serializeObject(inputOperation);

        //pendingOperationPromiseFunctionsById.set(inputOperation.id,[resolve,reject]);
        pendingOperationPromiseFunctionsById.set(inputOperationJSON.root.values.id,[resolve,reject]);
        console.log('[' + new Date() + '] '+"send "+operationModuleId+" with id ["+inputOperationJSON.root.values.id+"]");
        ws.send(operationData);
      //});
    
    });

    inputOperationPromise.then(function() {
        operationModuleIdIndex++;
        if(operationModuleIdIndex < operationModuleIdCount) {
          processSendOperationQueue();  
        } else {
          var promiseFunctions = pendingTransactionPromiseFunctionsById.get(transactionModuleIdIndex);

          //Unlock the processing of the next transaction in the array
          promiseFunctions[0]();

        }
    });

}

function receiveOperation(operationJSON) {
  if(operationJSON) {
    var deserializedOperation,
        operation,
        objectRequires,
        module,
        isSync = true;

    if(operationJSON.message === "Internal server error") {
         console.warn(serializedOperation);
    }

    //if(operation) {
    if(operationJSON.root) {
      console.log('[' + new Date() + '] '+"received "+operationJSON.root.values.type+" operation with referredId ["+operationJSON.root.values.referrerId+"]");
    } else {
      console.error('[' + new Date() + '] '+"received message:",operationJSON);
    }

    //var promiseFunctions = pendingOperationPromiseFunctionsById.get(operation.referrerId);
    var referrerId = operationJSON.root.values.referrerId,
        //referrerId = operation.referrerId
        promiseFunctions = pendingOperationPromiseFunctionsById.get(referrerId);

    if(operationJSON.root.values.type !== "commitTransactionProgressOperation" && operationJSON.root.values.type !== "performTransactionProgressOperation") {
        pendingOperationById.delete(referrerId);

        // console.log("Clearing promise for referrerId ["+referrerId+"]");
    
        //Unlock the processing of the next operation in the array
        setTimeout(() => {
          promiseFunctions[0]();
        }, timeoutBetweenOperations);    
    } else {
        console.log("transactionProgress: ",operationJSON.root.values.data*100+"%");
        //test
        //ws.send(serializedKeepAliveOperationString);
    }
}
};
 
ws.on('message', function incoming(data) {

  // console.log('[' + new Date() + '] '+"received message:",data);

  try {
    JSONMessage = JSON.parse(data);
  } catch (e) {
      return console.error('[' + new Date() + '] '+"Message data is not JSON:", data);
  }

  if(JSONMessage.message === "Endpoint request timed out") {
      console.log('[' + new Date() + '] '+"Ignoring Endpoint request timed out");
  } else {
    receiveOperation(JSONMessage);
  }

});

ws.on('close', function close(message) {
  console.log('[' + new Date() + '] '+"Socket closed with message:",message);
});

