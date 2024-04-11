var DataWorker = require("phront/worker/data-worker").DataWorker,
    Organization = require("phront/data/main.datareel/model/organization").Organization,
    Application = require("phront/data/main.datareel/model/app/application").Application,
    CognitoUserPool = require("phront/data/main.datareel/model/aws/cognito/user-pool").UserPool,
    CognitoUserPoolClient = require("phront/data/main.datareel/model/aws/cognito/user-pool").UserPoolClient,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    UserPool = require("phront/data/main.datareel/model/app/user-pool").UserPool,
    AppClient = require("phront/data/main.datareel/model/app/app-client").AppClient,
    PracticeObjectDescriptor = require("./data/main.datareel/model/practice.mjson").montageObject,
    WebSocketSession = require("phront/data/main.datareel/model/app/web-socket-session").WebSocketSession;

const WebSocket = require('isomorphic-ws'),
    crypto = require('crypto');

const successfullResponse = {
    statusCode: 200,
    body: 'Success'
};

const failedResponse = (statusCode, error) => ({
    statusCode,
    body: error
});

global.WebSocket = WebSocket;
/**
 * A Worker is any object that can handle messages from a serverless function
 * to implement custom businsess logic
 *
 * @class PlummingIntakeWorker
 * @extends Worker
 */
exports.PlummingIntakeWorker = DataWorker.specialize( /** @lends PlummingIntakeWorker.prototype */{
    constructor: {
        value: function DataWorker() {
            this.super();

            // this.addEventListener(DataOperation.Type.AuthorizeConnectionOperation, this, {capture: true});

        }
    },

    _provisionStorageForRootOrganization: {
        value: function() {
            var mainService = this.mainService;

            return Promise.all([
                mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(Organization)),
                mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(Application)),
                mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(UserPool)),
                mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(AppClient)),
                mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(WebSocketSession))
            ]);
        }
    },

    provisionStorageForRootOrganization: {
        value: function() {

            return this._provisionStorageForRootOrganization()
            .catch(function(error) {
                var message = error.message;
                if(
                    message
                    && message.contains("schema")
                    && message.contains(" does not exist")) {
                        //Retry once
                        return this._provisionStorageForRootOrganization();
                    } else {
                        return Promise.reject(error);
                    }

            });
        }
    },


    provisionRootOrganizationFromIdentity: {
        value: function(identity, cogentDesignCognitoUserPool, provisionAppClient) {
           var mainService = this.mainService;

           console.log("provisionRootOrganizationFromIdentity: create tables");

            console.log("provisionRootOrganizationFromIdentity: create objects");

            //Create the organization:
            var cogentDesignOrganization = mainService.createDataObject(Organization);
            cogentDesignOrganization.name = "Cogent Design, Inc.";



            var plummingProvisionApplication = mainService.createDataObject(Application);
            plummingProvisionApplication.name = 'plumming-provision';
            plummingProvisionApplication.controllingOrganization = cogentDesignOrganization;



            var cogentDesignUserPool = mainService.createDataObject(UserPool);
            /*
                Should probably be automated by some business logic
            */
            cogentDesignUserPool.name = cogentDesignCognitoUserPool.name;

            cogentDesignUserPool.cognitoUserPool = cogentDesignCognitoUserPool;
            cogentDesignOrganization.userPools = [cogentDesignUserPool];


            var plummingProvisionAppClient = mainService.createDataObject(AppClient);
            /*
                Should probably be automated by some business logic
            */
            plummingProvisionAppClient.name = plummingProvisionApplication.name;

            plummingProvisionAppClient.identifier = provisionAppClient.clientId;
            plummingProvisionAppClient.credentials = provisionAppClient.clientSecret;
            plummingProvisionAppClient.userPool = cogentDesignUserPool;
            plummingProvisionAppClient.cognitoUserPoolClient = provisionAppClient;
            plummingProvisionAppClient.application = plummingProvisionApplication;

            console.log("provisionRootOrganizationFromIdentity: saveChanges()");

            return mainService.saveChanges()
            .then(function() {
                console.log("provisionRootOrganizationFromIdentity: saveChanges() completed");

                return cogentDesignOrganization;
            })
            .catch(function(error) {
                console.log("provisionRootOrganizationFromIdentity: saveChanges() failed");

                return Promise.reject(error);
            });

            // })
            // .catch(function(error) {
            //     console.log("createStorageForObjectDescriptorIfNeeded failed with error: ",error);
            //     return Promise.reject(error);
            // });

       }
    },

    provisionRootIdentity: {
        value: function(identity) {

            console.log("provisionRootIdentity()",identity);

            // var UserPoolClientCriteria = new Criteria().initWithExpression("controllingOrganization == $.controllingOrganization", {
            //     controllingOrganization: organization
            // }),
            var self = this,
                userPoolQuery = DataQuery.withTypeAndCriteria(CognitoUserPool),
                intakeDataService =  this.mainService.childServiceForType(PracticeObjectDescriptor);

            userPoolQuery.fetchLimit = 5;
            
            return Promise.all([
                this.provisionStorageForRootOrganization(), 
                this.mainService.fetchData(userPoolQuery), 
                intakeDataService.checkInQuestionnaire(), 
                intakeDataService.createRolesIfNeeded()
            ])
            .then((results) => {
                var result = results[1],
                    cogentDesignCognitoUserPool;

                console.log("Cognito UserPool fetch result:",result);

                //Now find the CogentDesign one
                if(!result || result.length === 0) {
                    return Promise.reject(new Error ("Could not validate credentials"));
                } else {

                    for(var i=0, countI=result.length, iUserPool; (i<countI); i++ ) {
                        iUserPool = result[i];
                        if(iUserPool.name === "cogent-design") {
                            cogentDesignCognitoUserPool = iUserPool;
                            break;
                        }
                    }

                    if(!cogentDesignCognitoUserPool) {
                        throw new Error("No User Pool found for provisioning");
                    } else {
                        console.log("User Pool found for provisioning");
                    }

                    return self.mainService.getObjectProperties(cogentDesignCognitoUserPool,"appClients")
                    .then(function() {


                        /* 
                            Now find the appClient matching identity credentials 
                        */
                        var appClients = cogentDesignCognitoUserPool.appClients,
                            provisionAppClient;

                        console.log("Cognito UserPool fetch appClients result:",appClients);

                        for(var i=0, countI=appClients.length, iAppClient; (i<countI); i++ ) {
                            iAppClient = appClients[i];

                            if(iAppClient.clientName === "plumming-provision" && iAppClient.clientId === identity.applicationIdentifier) {
                                provisionAppClient = iAppClient;                
                                break;
                            }
                        }

                        if(!provisionAppClient) {
                            throw new Error("No App Client found for provisioning");
                        } else {
                            console.log("provision-plumming App Client Found");
                        }
    
                        /*
                            Now get the clientSecret to validate it:
                        */
                        return self.mainService.getObjectProperties(provisionAppClient,"clientSecret")
                        .then(function() {
                            if(provisionAppClient.clientSecret !== identity.applicationCredentials) {
                                throw new Error("Identity Credentials don't match provisioning credentials");
                            }

                            /*
                                Now we validated we have a legitimate
                            */
                            return self.provisionRootOrganizationFromIdentity(identity, cogentDesignCognitoUserPool, provisionAppClient);

                        });
    
    
        
                    })
                    .catch(function(error) {
                        console.error("Error fetching UserPool App clients:",error);
                        return Promise.reject(error);
                    });

                }


            });
        }
    },

    handleAuthorize: {
        value: async function(event, context, callback) {
            var self = this,
                superMethod = this.superForValue("handleAuthorize");

            //Try to let the work finish even if the gateway shuts the door on the other side.
            context.callbackWaitsForEmptyEventLoop = true;

            return superMethod.call(this, event, context, callback)
            .then(function(authorizationResponse) {
                var message = authorizationResponse?.context?.data?.message;

                console.log("authorizationResponse: ",authorizationResponse);

                if(authorizationResponse.policyDocument.Statement[0].Effect === "Deny" 
                    && authorizationResponse.context.type === "authorizeConnectionFailedOperation"
                    && message
                    && (
                        message.contains("schema")
                        ||
                        message.contains("relation")
                    )
                    && message.contains(" does not exist")) {
                        self.deserializer.init(authorizationResponse.principalId, self.require, /*objectRequires*/undefined, /*module*/undefined, /*isSync*/false);

                        console.log("authorizationResponse FAILED");

                        return self.deserializer.deserializeObject()
                        .then(function(identity) {
                            console.log("provisionRootIdentity:",identity);
                            return self.provisionRootIdentity(identity)
                        })
                        .then(function(organization) {
                            /*
                                One more try, we could rebuild the response, but this shoud really happen only once
                            */
                            return superMethod.call(self, event, context, callback);
                        })
                        .catch(function(error) {
                            console.error("handleAuthorize ... catch():",error, authorizationResponse);
                            authorizationResponse.context.data = error;
                            return authorizationResponse;
                        });
                } else {
                    return authorizationResponse;
                }
            });
        }
    },

    handleConnect: {
        value: function(event, context, cb) {
            //console.log("PlummingIntakeWorker -handleConnect: event:",JSON.stringify(event), "context:", JSON.stringify(context), "cb:", cb);
            return this.super(event, context, cb);
        }
    },
    handleMessage: {
        value: async function(event, context, callback) {
            //debugger;
            //console.log("PlummingIntakeWorker -handleMessage: event:",JSON.stringify(event), "context:", JSON.stringify(context));


            // this.setEnvironmentFromEvent(event);
            // var promise = this.operationCoordinator.handleMessage(event, context, callback, this.apiGateway);
            // promise.then(() => {
            //     callback(null, successfullResponse)
            // })
            // .catch((err) => {
            //     console.log(err)
            //     callback(failedResponse(500, JSON.stringify(err)))
            // });
            // context.callbackWaitsForEmptyEventLoop = false;

            //--- WORK?
            // try {
            //     this.setEnvironmentFromEvent(event);
            //     this.operationCoordinator.handleMessage(event, context, callback, this.apiGateway);
            //     //context.callbackWaitsForEmptyEventLoop = false;
            //     callback(null, successfullResponse);
            // }
            // catch (err) {
            //     console.log(err)
            //     callback(failedResponse(500, JSON.stringify(err)));
            // }
            //--- WORK?


            return this.super(event, context, callback);
        }
    },

    /*
        Intake Data Service is the one building the phront objects, from external input, so we don't have a clientId in data operations.

        We could add a way for a delegate to add it as well, but first we added a way for a delegate to decide per operation if it should be evaluated for aaccess control.
    */
    dataServiceShouldEvaluateAccessPoliciesForDataOperation: {
        value: function(dataService, dataOperation) {
            return true;
        }
    },


    /*
        We have access control for the Phront types, which is what ends up being saved, we're going to be more flexible on what we take in as it's already protected by an identity.
    */
        dataServiceAccessControlFailedForOperations: {
        value: function(dataService, failedOperations) {
            var isRawIntake = false,
                mainService = this.mainService;

            for(var i=0, countI = failedOperations.length, iOperation, iChildService; (i < countI); i++) {
                iOperation = failedOperations[i];
                iChildService = mainService.childServiceForType(iOperation.target)
                if( !iChildService || iChildService.name !== "PlummingIntakeDataService") {
                    isRawIntake = false;
                    break;
                } else {
                    isRawIntake = true;
                }
            }
            if( isRawIntake) {
                return false;
            } else {
                return true;
            }
        }
    },


    /* default implementation starts by forwarding data to our operation coordinator */
    // handleMessage: {
    //     value: async function(event, context, cb) {
    //         await this.operationCoordinator.handleMessage(event, context, cb, this.apiGateway);

    //         cb(null, {
    //           statusCode: 200,
    //           body: 'Sent.'
    //         });
    //     }
    // }

});
