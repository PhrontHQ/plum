'use strict';

var DataOperation = require("mod/data/service/data-operation").DataOperation,
    DataService = require("mod/data/service/data-service").DataService,
    // mainService = DataService.mainService,
    Criteria = require("mod/core/criteria").Criteria,
    //currentEnvironment = (require) ("mod/core/environment").currentEnvironment,
    // Object = (require) ("aws.mod/data/main.mod/model/s3/object").Object,
    ObjectDescriptor =  require("aws.mod/data/main.mod/model/s3/object.mjson").montageObject,
    Asset = require("business-data.mod/data/main.mod/model/asset").Asset,
    //Secret = (require) ("mod/data/model/app/secret").Secret,
    uuid = require("mod/core/uuid"),
    secretObjectDescriptor = require("mod/data/model/app/secret.mjson").montageObject;

const hostname = "roostergrinforms.com",
    path = "/perl/post/11397-16996-IOov",
    originHeader = "https://tops-forms.com",
    appointment_guid_key = "appointment_guid=",
    appointment_guid_key_length = appointment_guid_key.length,
    bucketRegion = process.env.bucket_region,
    bucketName = process.env.bucket_name,
    profile = process.env.profile,
    https = require("https"),
    // AWS = require('aws-sdk'),
    // S3Client = new AWS.S3({
    //     apiVersion: '2006-03-01',
    //     accessKeyId: process.env.aws_access_key_id,
    //     secretAccessKey: process.env.aws_secret_access_key,
    //     region: bucketRegion
    // }),
    crypto = require("crypto"),
    // secretsManagerRegion = "us-west-2",
    secretName = "ThreadAPIAuthorizationHeader",
    threadapiAuthenticationHostname = "threadapi.auth.us-west-2.amazoncognito.com",
    threadapiHostname = "api.threadcommunication.com",
    threadapiPath = "/oauth2/token",
    getPDFData = true;

var secret,
    threadAPIAuthorizationHeaderPromise,
    decodedBinarySecret;
    // SecretsManagerOptions = {
    //     apiVersion: '2017-10-17',
    //     region: secretsManagerRegion
    // },
    // credentials = new AWS.SharedIniFileCredentials({ profile: profile });


// if (credentials && credentials.accessKeyId !== undefined && credentials.secretAccessKey !== undefined) {
//     SecretsManagerOptions.credentials = credentials;
// }

// Create a Secrets Manager client
// var client = new AWS.SecretsManager(SecretsManagerOptions);

function threadAPIAuthorizationHeaderPromise() {
    return new Promise(function (resolve, reject) {

        var readOperation = new DataOperation();
        readOperation.type = DataOperation.Type.ReadOperation;
        readOperation.target = secretObjectDescriptor;
        readOperation.criteria = new Criteria().initWithExpression("name == $.name", {
            name: "ThreadAPIAuthorizationHeader"
        });

        secretObjectDescriptor.addEventListener(DataOperation.Type.ReadCompletedOperation, function(readCompletedOperation) {
            readCompletedOperation.stopImmediatePropagation();
            resolve(readCompletedOperation.data[0]);
        }, {
            capture: true,
            once: true
        });

        secretObjectDescriptor.addEventListener(DataOperation.Type.ReadFailedOperation, function(readFailedOperation) {
            readFailedOperation.stopImmediatePropagation();
            reject(readFailedOperation.data);
        }, {
            capture: true,
            once: true
        });

        secretObjectDescriptor.dispatchEvent(readOperation);

    });
};



/*
    This is registered in main.mjson as a function for now, so the conventioned name here isn't actually used by the eventManager in the distribution
*/

// exports.captureBatchOperation = function (batchOperation) {
//     console.log("batchOperation:", batchOperation.data);

//     // return new Promise(function (resolve, reject) {
//     //     console.log("handleReadOperation: 3000ms");
//     //       var timeoutHandle = setTimeout(() => {
//     //           clearTimeout(timeoutHandle);
//     //           resolve();
//     //       }, 3500);
//     //   });

// }

// exports.captureRespondentQuestionnaireCreateOperation = function (createOperation) {
//     var createData = createOperation.data;

//     console.log("captureRespondentQuestionnaireCreateOperation:", createData);

//     if (!createData.hasOwnProperty("pdfExportId")) {
//         console.log("createOperation doesn't have a pdfExport asset");
//     }

// }


function getAppointentPDFDataOnS3(appointmentOriginId) {
    return threadAPIAuthorizationHeaderPromise()
        .then(function (secret) {
            if (secret) {
                return new Promise(function (resolve, reject) {

                    /* Now get a token */
                    let authenticationRequestHeaders = {
                        "authorization": "Basic " + secret.value["Base64EncodedAuthorizationHeader"],
                        "content-type": "application/x-www-form-urlencoded"
                    },
                        authenticationRequestOptions = {
                            hostname: threadapiAuthenticationHostname,
                            path: threadapiPath,
                            method: "POST",
                            headers: authenticationRequestHeaders
                        };

                    const req = https.request(authenticationRequestOptions, res => {
                        //console.log(`authenticationRequest statusCode: ${res.statusCode}`);

                        let data = "";

                        res.on('data', d => {

                            /*
                              Expecting something like:
                              {
                                  "access_token":"eyJraWQiOiJZYXpmQmx2VE1iZ1BXZEVSaVB1enZQRnRsVVB3UjJZam0wV21SS2d6XC9NND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI1aXJhZTlrbDg1NmxjaHVxNG5qNnJvNmh2NyIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYm9va2luZ3NcL3Bvc3QgYm9va2luZ3NcL2dldCIsImF1dGhfdGltZSI6MTYxMjk0MDQ4OSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfbzJTQnZEelRaIiwiZXhwIjoxNjEyOTQ0MDg5LCJpYXQiOjE2MTI5NDA0ODksInZlcnNpb24iOjIsImp0aSI6IjZjZmZmNTk1LTkzMGMtNGQwMC1hMTczLWVlMDNjZmY1MTMzZCIsImNsaWVudF9pZCI6IjVpcmFlOWtsODU2bGNodXE0bmo2cm82aHY3In0.LFTLcVb2m7msNJeUVQN_VRHRrzWyoPXc_gKmzlKzwr-p3mMqwfZkGki0TkEbHoKHmvBAbm7eLJDgNn7pffF1U_F0qtADhcpRKeDLgw5H70-n_6FSztU9yqNe3xu3kA1_KWV4B48wcmuOl-nR0DL7Ic_M3AXLC36zXTdkPmMn9lY6Fw40kBJO_xroaCwDEMVHhEyr7KAb__UcWgDNtbe1BwXBddWQ9S6nYSn2BynwQDWiDILMRzOOySOHQHPTjqtEKejNAaBIgBP86vPxYrmTo6mUGzmqWLEHKUa88XysUmiozE54E24VE8cp3QxcKJ3DpPvsIR6nt6xg0w7CT5s2rw",
                                  "expires_in":3600,
                                  "token_type":"Bearer"
                                }
                            */
                            data += d;
                        });


                        res.on("end", () => {
                            resolve(JSON.parse(data));
                        });

                    });

                    req.on('error', error => {
                        console.error(error);
                        reject(error);
                    });

                    req.write("grant_type=client_credentials");
                    req.end();
                });
            } else {
                return Promise.resolve(null);
            }
        })
        .then(function (token) {

            if (token) {
                //console.log("token: ",token);
                return new Promise(function (resolve, reject) {

                    const options = {
                        hostname: threadapiHostname,
                        port: 443,
                        path: `/forms/form?appointment_guid=${appointmentOriginId}`,
                        method: 'GET',
                        headers: {
                            Authorization: token.access_token
                        }
                    };

                    /*
                      curl "https://api.threadcommunication.com/forms/form?appointment_guid=abc12d3e-d0af-4a22-8816-89397fb340ff" \
                        -H "Authorization: access_token"
                    */

                    //console.log("getAppointmentPDF Request Options: ", options);

                    const req = https.request(options, res => {
                        //console.log(`getAppointmentPDF Request statusCode: ${res.statusCode}`)

                        let data = "";
                        res.on('data', d => {
                            data += d;
                        });

                        res.on("end", () => {
                            if (res.statusCode !== 404) {
                                resolve(JSON.parse(data));
                            } else {
                                console.error(`getAppointmentPDF Request statusCode: ${res.statusCode} for appointmentOriginId ${appointmentOriginId}`);
                                resolve(null);
                            }
                        });

                    });

                    req.on('error', error => {
                        console.error("getAppointmentPDF Request Error:", error);
                        reject(error);
                    })

                    req.end();
                });
            } else {
                return Promise.resolve(null);
            }
        })
        .then(function (appointmentData) {

            const pdfRawBase64EncodedSource = (appointmentData && appointmentData.pdf) ? appointmentData.pdf.raw_source : null;

            if (pdfRawBase64EncodedSource) {
                let s3Key = "RespondentQuestionnaire/pdfExport/tops-aaoic-form-" + appointmentOriginId + ".pdf",
                    pdfRawSource = Buffer.from(pdfRawBase64EncodedSource, 'base64'),
                    //contentMD5 = crypto.createHash("md5").update(pdfRawSource).digest("base64"),
                    params = {
                        Body: pdfRawSource,
                        /*Bucket: bucketName,*/
                        Key: s3Key
                        /*"ContentMD5": contentMD5*/
                    };
    
                return new Promise(function (resolve, reject) {
                    var createDataOperation = new DataOperation();

                    createDataOperation.type = DataOperation.Type.CreateOperation;
                    createDataOperation.target = ObjectDescriptor;
                    createDataOperation.data = params;

                    ObjectDescriptor.addEventListener(DataOperation.Type.CreateCompletedOperation, function(createCompletedOperation) {
                        createCompletedOperation.stopImmediatePropagation();
                        var data = createCompletedOperation.data;
                        // data.appointmentOriginId = appointmentOriginId;

                        resolve(data);
                    }, {
                        capture: true,
                        once: true
                    });
            
                    ObjectDescriptor.addEventListener(DataOperation.Type.CreateFailedOperation, function(createFailedOperation) {
                        createFailedOperation.stopImmediatePropagation();
                        console.log("S3 Object Creation for RespondenQuestionnaire failed:",createFailedOperation);
                        reject(createFailedOperation.data);
                    }, {
                        capture: true,
                        once: true
                    });
            
                    ObjectDescriptor.dispatchEvent(createDataOperation);
    

                    // S3Client.putObject(params, function (err, data) {
                    //     if (err) {

                    //         console.log(err, err.stack); // an error occurred
                    //         callback(null, JSON.stringify(err));

                    //     }
                    //     else {
                    //         /*
                    //             data is like:
                    //             data = {
                    //             ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
                    //             VersionId: "Bvq0EDKxOcXLJXNo_Lkz37eM3R4pfzyQ"
                    //             }
                    //         */
                    //         // console.log(data);           // successful response

                    //         return {
                    //             appointmentOriginId: appointmentOriginId,
                    //             Bucket: bucketName,
                    //             Key: s3Key,
                    //             ETag: data.ETag,
                    //             Location: `https://${bucketName}.s3-${bucketRegion}.amazonaws.com/${s3Key}`
                    //         };

                    //     }
                    // });
                });

            } else {
                if (appointmentData) {
                    console.log("No pdf data found in appointmentData " + JSON.stringify(appointmentData));
                } else {
                    console.log("No appointment data found for appointment guid " + appointmentOriginId);
                }

                return null;
            }

        })
        .catch(function (error) {
            console.error("getAppointentPDFDataOnS3 error:", error);
            return Promise.reject(error);
        });

}


function updateRespondentQuestionnaireWithS3Data(originId, iRecordToUpdateByAppointmentOriginId, iOperationToUpdateByAppointmentOriginId,readCompletedOperation) {

    return getAppointentPDFDataOnS3(originId)
    .then(function(s3LocationData) {
        var mainService = DataService.mainService,
            assetObjectDescriptor = mainService.objectDescriptorForType(Asset),
            respondentQuestionnaireObjectDescriptor = readCompletedOperation.target,
            useDataAPI = mainService.childServiceForType(assetObjectDescriptor).useDataAPI,
            i, countI, dataOperations, iAssetId,
            iCreateDataOperation, iRespondentQuestionnnaires,
            j, countJ, jRespondentQuestionnaire, jUpdateOperation, currentDate = new Date();
            
            if(!s3LocationData) return Promise.resolve(null);

            iAssetId = uuid.generate();
            /*
                s3LocationData looks like:
                {
                    appointmentOriginId: appointmentOriginId,
                    Bucket: bucketName,
                    Key: s3Key,
                    ETag: data.ETag,
                    Location: `https://${bucketName}.s3-${bucketRegion}.amazonaws.com/${s3Key}`
                };
            */

            //Setup the create data operation for the asset:
            iCreateDataOperation = new DataOperation();
            iCreateDataOperation.type = DataOperation.Type.CreateOperation;
            iCreateDataOperation.target = assetObjectDescriptor;
            iCreateDataOperation.data = {
                id: iAssetId,
                s3Location: s3LocationData.Location,
                s3BucketName: s3LocationData.Bucket,
                s3ObjectKey: s3LocationData.Key,
                creationDate: currentDate,
                modificationDate: currentDate
            };

            (dataOperations || (dataOperations = [])).push(iCreateDataOperation);


            //Update the RespondentQuestionnaire:
            iRespondentQuestionnnaires = iRecordToUpdateByAppointmentOriginId.get(originId);
            for(j=0, countJ = iRespondentQuestionnnaires.length; (j < countJ); j++) {

                jRespondentQuestionnaire = iRespondentQuestionnnaires[j];
                //Setup the create data operation for the asset:
                jUpdateOperation = new DataOperation();
                jUpdateOperation.type = DataOperation.Type.UpdateOperation;
                jUpdateOperation.criteria = new Criteria().initWithExpression("id == $.id", {
                    id: jRespondentQuestionnaire.id
                });
        
                jUpdateOperation.target = respondentQuestionnaireObjectDescriptor;
                jUpdateOperation.data = {
                    pdfExportId: iAssetId,
                    modificationDate: currentDate
                };
                (dataOperations || (dataOperations = [])).push(jUpdateOperation);
            }

        return new Promise(function (resolve, reject) {

            var commitTransaction = new DataOperation();
            commitTransaction.type = DataOperation.Type.CommitTransactionOperation;
            commitTransaction.target = DataService.mainService;
            commitTransaction.data = {
                operations: dataOperations
            };

            mainService.addEventListener(DataOperation.Type.CommitTransactionCompletedOperation, function(commitTransactionCompletedOperation) {
                commitTransactionCompletedOperation.stopImmediatePropagation();


                //Now we need to update the read operaations:
                var records = iRecordToUpdateByAppointmentOriginId.get(originId),
                    operations = iOperationToUpdateByAppointmentOriginId.get(originId),
                    i, countI, iRecord, iOperation;

                for(i = 0, countI = records.length; (i < countI); i++) {
                    iRecord = records[i];
                    iOperation = operations[i];

                    iRecord.pdfExportId = iAssetId;
                    if(useDataAPI) {
                        iOperation[0].stringValue = JSON.stringify(iRecord);
                    } else {
                        // iOperation.to_jsonb = iRecord;
                        operations[i] = iRecord;
                    }
                }

                resolve(commitTransactionCompletedOperation);
            }, {
                capture: true,
                once: true
            });
    
            mainService.addEventListener(DataOperation.Type.CommitTransactionFailedOperation, function(commitTransactionFailedOperation) {
                commitTransactionFailedOperation.stopImmediatePropagation();
                console.log("Asset Creation Transaction for RespondenQuestionnaire failed:",commitTransactionFailedOperation);
                reject(commitTransactionFailedOperation.data);
            }, {
                capture: true,
                once: true
            });
    
            mainService.dispatchEvent(commitTransaction);
        });

    })
    .catch(function(error) {
        console.error("handleRespondentQuestionnaireReadCompletedOperation: ",error);
        throw error;
    });


}


exports.handleRespondentQuestionnaireReadCompletedOperation = function (readCompletedOperation) {
    
    var readCompletedOperationData = readCompletedOperation.data,
        mainService = DataService.mainService,
        useDataAPI = mainService.childServiceForType(readCompletedOperation.target).useDataAPI,
        i, countI, iRecord,
        iRecordToUpdateByAppointmentOriginId = new Map(),
        iOperationToUpdateByAppointmentOriginId = new Map(),
        iRecordToUpdateIterator,
        iOriginId,
        iRecords,
        iOperations,
        getPDFPromises;

    for (i = 0, countI = readCompletedOperationData.length; (i < countI); i++) {
        iRecord = useDataAPI 
            ? JSON.parse(readCompletedOperationData[i][0].stringValue)
            : readCompletedOperationData[i].to_jsonb;
        if (iRecord.pdfExportId === null) {
            iRecords = iRecordToUpdateByAppointmentOriginId.get(iRecord.originId);
            if (!iRecords) {
                iRecordToUpdateByAppointmentOriginId.set(iRecord.originId, (iRecords = []));
            }
            iRecords.push(iRecord);


            iOperations = iOperationToUpdateByAppointmentOriginId.get(iRecord.originId);
            if (!iOperations) {
                iOperationToUpdateByAppointmentOriginId.set(iRecord.originId, (iOperations = []));
            }
            iOperations.push(readCompletedOperationData[i]);

        }
    }

    if (iRecordToUpdateByAppointmentOriginId.size) {

        //("handleRespondentQuestionnaireReadCompletedOperation: ", readCompletedOperation);

        getPDFPromises = [];

        iRecordToUpdateIterator = iRecordToUpdateByAppointmentOriginId.keys();
        while ((iOriginId = iRecordToUpdateIterator.next().value)) {
            iRecords = iRecordToUpdateByAppointmentOriginId.get(iOriginId);
            getPDFPromises.push(
                    updateRespondentQuestionnaireWithS3Data(iOriginId,iRecordToUpdateByAppointmentOriginId, iOperationToUpdateByAppointmentOriginId, readCompletedOperation)
            );
        }

        return Promise.all(getPDFPromises)
        .catch(function(error) {
            console.error("handleRespondentQuestionnaireReadCompletedOperation: Error ",error);
            readCompletedOperation.stopImmediatePropagation();

            var readFailedOperation = new DataOperation();
            readFailedOperation.referrerId = readCompletedOperation.referrerId;
            readFailedOperation.type = DataOperation.Type.ReadFailedOperation;
            readFailedOperation.target = readCompletedOperation.target;
            readFailedOperation.context = readCompletedOperation.context;
            readFailedOperation.clientId = readCompletedOperation.clientId;
            readFailedOperation.data = error;

            // console.log("Unauthorized Read Operation for type: "+createTransactionOperation.target.name, createTransactionOperation);

            readFailedOperation.target.dispatchEvent(readFailedOperation);
            return readFailedOperation;
        });
    }

};