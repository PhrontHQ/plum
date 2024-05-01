
const WebSocket = require('ws');
const https = require("https");
require('montage/core/extras/string');
const PATH = require("path");
const fs = require('fs');
const Deserializer = require("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer;
const MontageSerializer = require("montage/core/serialization/serializer/montage-serializer").MontageSerializer;
const Criteria = require("montage/core/criteria").Criteria;
const DataOperation = require("montage/data/service/data-operation").DataOperation;
const zlib = require('zlib');

(function () {
    "use strict";

    function btoa(str) {
        var buffer;

        if (str instanceof Buffer) {
            buffer = str;
        } else {
            buffer = Buffer.from(str.toString(), 'binary');
        }

        return buffer.toString('base64');
    }

    global.btoa = btoa;
}());


//See https://www.npmjs.com/package/commander
const { program } = require('commander');

program.option('-ses, --session <.mjson file>', 'The moduleId of a serialized session to use to connect to plumming-intake')
    .option('-doi, --dataOperationIndex <operationIndexFile>', 'The json file describing the transactions to process', "")
    .option('-s, --stage <stage>', 'The stage to use', "staging")
    .option('-ws, --webSocketURL <webSocketURL>', 'The webSocketURL to use to send and receive', "")
    .option('-http, --httpURL <httpURL>', 'The httpURL to use to post transaction data', "");

program.parse(process.argv);

var sessionPath = program.session,
    stage = program.stage,
    transactionJSONFileFullPath = program.dataOperationIndex,
    webSocketURL = program.webSocketURL,
    httpURLString = program.httpURL,
    httpURL = new URL(httpURLString);



var ws,
    serializedSession,
    session,
    clientId,
    encodingBuffer,
    base64Session,
    base64EncodedSerializedSession,
    timeoutBetweenOperations,
    sessionArgument,
    socketUrl;

const isDev = (stage === "mod");

serializedSession = fs.readFileSync(sessionPath, 'utf8');

base64EncodedSerializedSession = btoa(serializedSession);
encodingBuffer = Buffer.from(serializedSession, 'utf-8');
base64Session = encodingBuffer.toString('base64');
sessionArgument = "?session=" + base64EncodedSerializedSession;

if (isDev) {
    timeoutBetweenOperations = 0;
} else {
    //Local proxy of above:
    // ws = new WebSocket('wss://localhost:60103/');
    // process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    timeoutBetweenOperations = 280;
}

socketUrl = webSocketURL + sessionArgument;




// var transactionJSONFile = "mock-input-operations/tops-ortho-samples/transactions/live-export-1/index.json";
// var transactionJSONFileFullPath = PATH.join(__dirname, transactionJSONFile);
//var transactionJSONFileDirectory = PATH.join(__dirname, transactionJSONFile.stringByDeletingLastPathComponent());
var transactionJSONFileDirectory = transactionJSONFileFullPath.stringByDeletingLastPathComponent();

// const Deserializer = (require)("montage/core/serialization/deserializer/montage-deserializer").MontageDeserializer,
//       MontageSerializer = (require)("montage/core/serialization/serializer/montage-serializer").MontageSerializer,
//module.path in pure node is module.directory in mr
//module.filename in pure node is module.locaation in mr

//transactionJSONData = fs.readFileSync(PATH.join(__dirname, transactionJSONFile), 'utf8'),
const transactionJSONData = fs.readFileSync(transactionJSONFileFullPath, 'utf8'),
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
        "root": {
            "values": {
                "id": "3E6F3D77-EDB1-47C3-AB38-B0ED127782AC",
                "type": "keepAlive",
                "data": null
            },
            "prototype": "montage/data/service/data-operation"
        }
    },
    serializedKeepAliveOperationString = JSON.stringify(serializedKeepAliveOperation);



function setupWebSocket(ws) {
    ws.on('error', function error(error) {

        // if(error.statusCode )
        var endMilliseconds = Date.now(),
            timePassed = (endMilliseconds - startMilliseconds);
    
        if (timePassed > 29000 && timePassed < 50000) {
            //Re-try
            console.warn(timePassed + "ms later, connection timed out, retrying...");
            setupWebSocket(ws = new WebSocket(socketUrl));
        }
    
    });
    
    ws.on('open', function open() {
        deserializer.init(serializedSession, require, /*objectRequires*/undefined, /*module*/undefined, /*isSync*/false);
        try {
            sessionPromise = deserializer.deserializeObject()
                .then(function (_session) {
                    session = _session;
                    processTransactionQueue();
                });
        } catch (error) {
            return Promise.reject(error);
        }
    
    });
    
    ws.on('message', function incoming(data) {
    
        // console.log('[' + new Date() + '] '+"received message:",data);
    
        try {
            JSONMessage = JSON.parse(data);
        } catch (e) {
            return console.error('[' + new Date() + '] ' + "Message data is not JSON:", data);
        }
    
        if (JSONMessage.message === "Endpoint request timed out") {
            console.log('[' + new Date() + '] ' + "Ignoring Endpoint request timed out");
        } else {
            receiveOperation(JSONMessage);
        }
    
    });
    
    ws.on('close', function close(message) {
        console.log('[' + new Date() + '] ' + "Socket closed with message:", message);
    });
    
}

/*
    On the server side:  {rejectUnauthorized: false}

*/

var startMilliseconds = Date.now();
ws = new WebSocket(socketUrl
    /*
    ,{
    cert: fs.readFileSync("./workers/main/node_modules/business-data.mod/dev/local-ssl-certificate-authority/phront.local.crt"),
    key:
    fs.readFileSync("./workers/main/node_modules/business-data.mod/dev/local-ssl-certificate-authority/phront.local.key")

    }*/);
setupWebSocket(ws);

function processTransactionQueue() {

    var inputTransactionPromise = new Promise(function (resolve, reject) {

        var transactionModuleId = transactionModuleIds[transactionModuleIdIndex],
            //Path should be relative to the json file:
            fullPath = PATH.join(transactionJSONFileDirectory, transactionModuleId),
            transactionData;

        if (fs.lstatSync(fullPath).isDirectory()) {
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

        pendingTransactionPromiseFunctionsById.set(transactionModuleIdIndex, [resolve, reject]);
        console.log("Processsing transaction: " + PATH.join(__dirname, transactionModuleId));
        processSendOperationQueue();

    });

    inputTransactionPromise.then(function () {

        //Cleanup before we move on to the next
        pendingTransactionPromiseFunctionsById.delete(transactionModuleIdIndex);

        transactionModuleIdIndex++;
        if (transactionModuleIdIndex < transactionModuleIdCount) {
            processTransactionQueue();
        } else {
            console.log("Competed processing of all transactions");
        }
    });

}

function _registerMergeOperationFromData(operationData, operations) {
    deserializer.init(operationData, require, /*objectRequires*/undefined, /*module*/undefined, /*isSync*/false);
    try {
        /*
          mergeOperation.target isn't deserialized from for example

                "target" : "data/main.mod/model/procedure_types",

          because we don't have the ObjectDescriptors loaded here. 

          So we're going to get it from the pure JSON.

        */

        var operationData = JSON.parse(operationData);

        return deserializer.deserializeObject()
            .then(function (mergeOperation) {
                var targetModuleId = mergeOperation.target ? mergeOperation.target : mergeOperation.targetModuleId,
                    targetEntry = operations[targetModuleId];

                if (!targetEntry) {
                    operations[targetModuleId] = targetEntry = {
                        mergeOperations: []
                    };
                }
                targetEntry.mergeOperations.push(mergeOperation);

                return mergeOperation;
            });
    } catch (error) {
        return Promise.reject(error);
    }
}

function oneShotCommitTransactionOperationData() {
    //We're going to read all merge from 1-operationModuleIdCount-2
    var operations = {},
        i = operationModuleIdIndex, //should be 1 when we start 
        countI = operationModuleIdCount - 1,
        operationModuleId,
        operationData,
        inputOperationJSON,
        operationPromise,
        operationPromises = []; //last merge

    while (i < countI) {
        operationModuleId = operationModuleIds[i];
        operationData = fs.readFileSync(PATH.join(transactionJSONFileDirectory, operationModuleId), 'utf8');
        //inputOperationJSON = JSON.parse(operationData);
        if (operationData) {
            operationPromises.push(_registerMergeOperationFromData(operationData, operations));
        }
        operationModuleIdIndex++;
        i++;
    }

    return Promise.all(operationPromises)
        .then(function (commitTransactionOperations) {
            operationModuleId = operationModuleIds[i];

            commitOperationData = fs.readFileSync(PATH.join(transactionJSONFileDirectory, operationModuleId), 'utf8');
            deserializer.init(commitOperationData, require, /*objectRequires*/undefined, /*module*/undefined, /*isSync*/false);
            try {
                operationPromise = deserializer.deserializeObject();
            } catch (error) {
                return Promise.reject(error);
            }

            return operationPromise
                .then(function (commitOperation) {

                    /*
                            commitOperation.data.operations is now an object where keys are objectDescriptor moduleIds, and value of keys are an object with the structure:
                    {
                      "data/main.mod/model/practice": {
                          mergeOperations: [op1,op2,op3,...],
                          deleteOperations: [op1,op2,op3,...]
                        }
                      },
                      "data/main.mod/model/patients": {
                          mergeOperations: [op1,op2,op3,...],
                          deleteOperations: [op1,op2,op3,...]
                        }
                      }
                    }
                    */

                    commitOperation.data = {
                        operations: operations
                    };

                    //We can't get the body of a post in a lambda authorizer, but we could in a Lambda Edge apparently
                    // commitOperation.session = session;
                    commitOperation.clientId = clientId; //global for now
                    console.log("Before Serialization, commitTransaction:", commitOperation);

                    operationData = serializer.serializeObject(commitOperation);

                    return {
                        operationModuleId: operationModuleId,
                        operationData: operationData,
                        inputOperationJSON: JSON.parse(operationData)
                    };

                });


        });


}

function postOperationData(operationData) {

    console.log("postOperationData", operationData);

    return new Promise(function (resolve, reject) {

        var operationDataByteSize = Buffer.byteLength(operationData, 'utf8'),
            operationDataKBSize = operationDataByteSize / 1024;

        console.log(`operationData size in B: ${operationDataKBSize}B`);
        console.log(`operationData Size in KB: ${operationDataKBSize}KB`);

        zlib.gzip(operationData, function (err, buffer) {

            var operationDataByteSize = Buffer.byteLength(buffer, 'utf8'),
                operationDataKBSize = operationDataByteSize / 1024;

            console.log(`gzipped operationData in B: ${operationDataByteSize}B`);
            console.log(`gzipped operationData Size in KB: ${operationDataKBSize}MB`);

            let headers = {
                "Content-Encoding": "gzip" // signal server that the data is compressed
            },
                options = {
                    hostname: httpURL.hostname,
                    path: httpURL.pathname + sessionArgument,
                    method: "POST",
                    headers: headers
                    /*
                    ,
                    headers: {
                      "Content-Type": "application/json",
                      "Content-Length": Buffer.byteLength(body)
                    }
                    */
                };

            // Object.assign(headers, event.headers);
            // headers.Referer = `https://tops-forms.com/covid-consent-form/index.html?appointment_guid=${guid}`;
            // headers.Origin = originHeader;
            // headers.Host = hostname;


            var req = https.request(options, res => {
                // Detect a redirect
                if (res.statusCode > 300 && res.statusCode < 400) {
                    resolve({
                        guid: guid,
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: res.body
                    });
                } else {
                    let data = "";
                    res.on("data", d => {
                        data += d;
                    });
                    res.on("end", () => {
                        console.log(data);

                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            body: data
                        });
                    });
                }

            })
                .on("error", reject)
                .end(buffer);
        });

    });
}

function processSendOperationQueue() {
    console.log("processSendOperationQueue()");

    var inputOperationPromise = new Promise(function (resolve, reject) {
        var operationModuleId = operationModuleIds[operationModuleIdIndex],
            //operationData = fs.readFileSync(PATH.join(__dirname, operationModuleId), 'utf8'),
            operationData = fs.readFileSync(PATH.join(transactionJSONFileDirectory, operationModuleId), 'utf8'),

            inputOperationJSON = JSON.parse(operationData),
            operationDataPromise;



        if (operationModuleIdIndex === 1 && inputOperationJSON.root.values.type === "mergeOperation") {
            oneShotCommitTransactionOperationData()
                .then(function (operationDetails) {
                    var operationModuleId = operationDetails.operationModuleId,
                        inputOperationJSON = operationDetails.inputOperationJSON,
                        operationData = operationDetails.operationData;

                    pendingOperationById.set(inputOperationJSON.root.values.id, inputOperationJSON);
                    pendingOperationPromiseFunctionsById.set(inputOperationJSON.root.values.id, [resolve, reject]);
                    console.log('[' + new Date() + '] ' + "send " + operationModuleId + " with id [" + inputOperationJSON.root.values.id + "]");

                    var operationDataByteSize = Buffer.byteLength(operationData, 'utf8'),
                        operationDataKBSize = operationDataByteSize / 1024;

                    console.log(`operationData size in B: ${operationDataKBSize}B`);
                    console.log(`operationData Size in KB: ${operationDataKBSize}KB`);

                    ws.send(operationData);

                    // postOperationData(operationData)
                    // .then(function(value) {
                    //   console.log("postOperationData complete", value);
                    // })
                    // .catch(function(error) {
                    //   console.log("postOperationData error:", error);
                    // });

                });
        } else {

            //var operationPromise = require.async(operationModuleId).then(function(value) {
            //inputOperation = value.montageObject;

            //pendingOperationById.set(inputOperation.id, inputOperation);
            pendingOperationById.set(inputOperationJSON.root.values.id, inputOperationJSON);
            //serializedInputOperation = serializer.serializeObject(inputOperation);

            //pendingOperationPromiseFunctionsById.set(inputOperation.id,[resolve,reject]);
            pendingOperationPromiseFunctionsById.set(inputOperationJSON.root.values.id, [resolve, reject]);
            console.log('[' + new Date() + '] ' + "send " + operationModuleId + " with id [" + inputOperationJSON.root.values.id + "]");
            ws.send(operationData);
            //});        }
        }
    });

    inputOperationPromise.then(function () {
        operationModuleIdIndex++;
        if (operationModuleIdIndex < operationModuleIdCount) {
            processSendOperationQueue();
        } else {
            var promiseFunctions = pendingTransactionPromiseFunctionsById.get(transactionModuleIdIndex);

            //Unlock the processing of the next transaction in the array
            promiseFunctions[0]();

        }
    });

}

function receiveOperation(operationJSON) {
    console.debug("receiveOperation " + operationJSON);

    if (operationJSON) {
        var deserializedOperation,
            operation,
            objectRequires,
            module,
            createdAppClients,
            isSync = true;

        if (operationJSON.root) {
            //console.log("receiveOperation " + operationJSON.root.values.type, operationJSON);
            console.log("receiveOperation " + operationJSON.root.values.type, JSON.stringify(operationJSON));

            if ((operationJSON.root.values.type === "commitTransactionCompletedOperation" || operationJSON.root.values.type === "performTransactionCompletedOperation") && (createdAppClients = (operationJSON.root.values.data?.createdDataObjects && operationJSON.root.values.data?.createdDataObjects["data/main.mod/model/app/app-client"]?.rawData))) {
                if (sessionPath.endsWith("/provision-session.mjson")) {
                    var serializedOrganizationsessionPath = `${PATH.dirname(sessionPath)}/organization-session.mjson`,
                        serializedOrganizationIdentity = fs.readFileSync(serializedOrganizationsessionPath, 'utf8'),
                        serializedOrganizationIdentityJSON = JSON.parse(serializedOrganizationIdentity);


                    for (var i = 0, countI = createdAppClients.length, item; (i < countI); i++) {
                        item = createdAppClients[i];
                        if (item && item.name === "plumming-tool") {
                            serializedOrganizationIdentityJSON.identity.values.applicationIdentifier = item.identifier;
                            serializedOrganizationIdentityJSON.identity.values.applicationCredentials = item.credentials;
                            serializedOrganizationIdentity = JSON.stringify(serializedOrganizationIdentityJSON);
                            fs.writeFileSync(serializedOrganizationsessionPath, serializedOrganizationIdentity, { encoding: 'utf8' })
                            break;
                        }
                    }

                    console.log(JSON.stringify(operationJSON));
                }
                console.log("received "+operationJSON.root.values.type+" for provisioning Practice:", operationJSON);
            }
        }

        if (operationJSON.message === "Internal server error") {
            console.warn(operationJSON);
        }

        //if(operation) {
        if (operationJSON.root) {
            console.log('[' + new Date() + '] ' + "received " + operationJSON.root.values.type + " operation with referredId [" + operationJSON.root.values.referrerId + "]");
        } else {
            console.error('[' + new Date() + '] ' + "received message:", operationJSON);
        }

        //var promiseFunctions = pendingOperationPromiseFunctionsById.get(operation.referrerId);
        var referrerId = operationJSON.root.values.referrerId,
            //referrerId = operation.referrerId
            promiseFunctions = pendingOperationPromiseFunctionsById.get(referrerId);

        /* global */
        if (!clientId) {
            clientId = operationJSON.root.values.clientId;
        }

        if (operationJSON.root.values.type !== "commitTransactionProgressOperation" && operationJSON.root.values.type !== "performTransactionProgressOperation") {
            if (operationJSON.root.values.type === "readCompletedOperation") {
                console.log("readCompletedOperation: ", JSON.stringify(operationJSON));
            }
            pendingOperationById.delete(referrerId);

            // console.log("Clearing promise for referrerId ["+referrerId+"]");

            //Unlock the processing of the next operation in the array
            setTimeout(() => {
                promiseFunctions[0]();
            }, timeoutBetweenOperations);
        } else {
            console.log("transactionProgress: ", operationJSON.root.values.data * 100 + "%");
            //test
            //ws.send(serializedKeepAliveOperationString);
        }
    }
}


