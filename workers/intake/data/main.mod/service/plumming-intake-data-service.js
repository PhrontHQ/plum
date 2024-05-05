// const { map } = require("mod/core/collections/shim-object");
// const { resetUnhandledRejections } = require("mod/core/q");

var DataService = require("mod/data/service/data-service").DataService,
    RawDataService = require("mod/data/service/raw-data-service").RawDataService,
    Criteria = require("mod/core/criteria").Criteria,
    ObjectDescriptor = require("mod/core/meta/object-descriptor").ObjectDescriptor,
    DataQuery = require("mod/data/model/data-query").DataQuery,
    DataStream = require("mod/data/service/data-stream").DataStream,
    Montage = require("mod").Montage,
    Promise = require("mod/core/promise").Promise,
    DataOrdering = require("mod/data/model/data-ordering").DataOrdering,
    DESCENDING = DataOrdering.DESCENDING,
    evaluate = require("mod/core/frb/evaluate"),
    Set = require("mod/core/collections/set"),
    Map = require("mod/core/collections/map"),
    MontageSerializer = require("mod/core/serialization/serializer/mod-serializer").MontageSerializer,
    Deserializer = require("mod/core/serialization/deserializer/mod-deserializer").MontageDeserializer,
    DataOperation = require("mod/data/service/data-operation").DataOperation,
    uuid = require("mod/core/uuid"),
    DataEvent = require("mod/data/model/data-event").DataEvent,
    DataOrdering = require("mod/data/model/data-ordering").DataOrdering,
    DeleteRule = require("mod/core/meta/property-descriptor").DeleteRule,
    Locale = require("mod/core/locale").Locale,
    DataTrigger = require("business-data.mod/data/main.mod/service/data-trigger").DataTrigger,
    defaultEventManager = require("mod/core/event/event-manager").defaultEventManager,
    Position = require("business-data.mod/data/main.mod/model/position").Position,
    EmploymentPosition = require("business-data.mod/data/main.mod/model/employment-position").EmploymentPosition,
    EmploymentPositionStaffing = require("business-data.mod/data/main.mod/model/employment-position-staffing").EmploymentPositionStaffing,
    EmploymentPositionRelationship = require("business-data.mod/data/main.mod/model/employment-position-relationship").EmploymentPositionRelationship,
    Role = require("business-data.mod/data/main.mod/model/role").Role,
    Country = require("business-data.mod/data/main.mod/model/country").Country,
    Organization = require("business-data.mod/data/main.mod/model/organization").Organization,
    Application = require("business-data.mod/data/main.mod/model/app/application").Application,
    CognitoUserPool = require("aws.mod/data/main.mod/model/cognito/user-pool").UserPool,
    CognitoUserPoolClient = require("aws.mod/data/main.mod/model/cognito/user-pool-client").UserPoolClient,

    UserPool = require("business-data.mod/data/main.mod/model/app/user-pool").UserPool,
    //UserPoolClient = require("business-data.mod/data/main.mod/model/app/user-pool-client").UserPoolClient,
    AppClient = require("business-data.mod/data/main.mod/model/app/app-client").AppClient,
    PostalAddress = require("business-data.mod/data/main.mod/model/messaging-channel/postal-address").PostalAddress,
    PartyPostalAddress = require("business-data.mod/data/main.mod/model/messaging-channel/party-postal-address").PartyPostalAddress,
    EmailAddress = require("business-data.mod/data/main.mod/model/messaging-channel/email-address").EmailAddress,
    PartyEmailAddress = require("business-data.mod/data/main.mod/model/messaging-channel/party-email-address").PartyEmailAddress,
    PhoneNumber = require("business-data.mod/data/main.mod/model/messaging-channel/phone-number").PhoneNumber,
    PartyPhoneNumber = require("business-data.mod/data/main.mod/model/messaging-channel/party-phone-number").PartyPhoneNumber,
    PartySMSNumber = require("business-data.mod/data/main.mod/model/messaging-channel/party-s-m-s-number").PartySMSNumber,
    ContactForm = require("business-data.mod/data/main.mod/model/messaging-channel/contact-form").ContactForm,
    PartyContactForm = require("business-data.mod/data/main.mod/model/messaging-channel/party-contact-form").PartyContactForm,
    InstantMessageAddress = require("business-data.mod/data/main.mod/model/messaging-channel/instant-message-address").InstantMessageAddress,
    PartyInstantMessageAddress = require("business-data.mod/data/main.mod/model/messaging-channel/party-instant-message-address").PartyInstantMessageAddress,

    Service = require("business-data.mod/data/main.mod/model/service").Service,
    ServiceEngagement = require("business-data.mod/data/main.mod/model/service-engagement").ServiceEngagement,
    CustomerEngagementQuestionnaire = require("business-data.mod/data/main.mod/model/customer-engagement-questionnaire").CustomerEngagementQuestionnaire,
    Calendar = require("business-data.mod/data/main.mod/model/calendar").Calendar,
    Event = require("business-data.mod/data/main.mod/model/event").Event,
    Person = require("business-data.mod/data/main.mod/model/person").Person,
    PersonalRelationship = require("business-data.mod/data/main.mod/model/personal-relationship").PersonalRelationship,
    B2CCustomerSupplierRelationship = require("business-data.mod/data/main.mod/model/b-2-c-customer-supplier-relationship").B2CCustomerSupplierRelationship,
    B2BCustomerSupplierRelationship = require("business-data.mod/data/main.mod/model/b-2-b-customer-supplier-relationship").B2BCustomerSupplierRelationship,
    B2CCustomerSupplierResponsibleParty = require("business-data.mod/data/main.mod/model/b-2-c-customer-supplier-responsible-party").B2CCustomerSupplierResponsibleParty,
    RoleRanking = require("business-data.mod/data/main.mod/model/role-ranking").RoleRanking,
    Asset = require("business-data.mod/data/main.mod/model/asset").Asset,
    Gender = require("business-data.mod/data/main.mod/model/gender").Gender,
    PersonName = require("business-data.mod/data/main.mod/model/person-name").PersonName,
    ServiceProductVariant = require("business-data.mod/data/main.mod/model/service-product-variant").ServiceProductVariant,
    GeoProjection = require("mod-geo/logic/model/projection").Projection,
    defaultProjection = GeoProjection.forSrid("4326"),
    GeoPoint =  require("mod-geo/logic/model/point").Point,
    Locale = require("mod/core/locale").Locale,
    MontageCalendar = require("mod/core/date/calendar").Calendar,
    systemCalendar = MontageCalendar.withIdentifier("gregory"),
    TimeZone = require("mod/core/date/time-zone").TimeZone,

    //Set default systemLocale that the DataService will pickup
    systemLocale = Locale.systemLocale = Locale.withIdentifier("en", {
        calendar: systemCalendar,
        numberingSystem: "latn"
    }),
    englishLocale = systemLocale,
    frenchLocale = Locale.withIdentifier("fr", {
        calendar: systemCalendar,
        numberingSystem: "latn"
    }),

    Range = require("mod/core/range").Range,
    Duration = require("mod/core/duration").Duration,

    eventOrganizerRoleInstance,
    eventAttendeeRoleInstance,
    patientRoleInstance,
    financialResponsibilityRoleInstance,
    customerPreferenceRoleInstance,
    emergencyContactRoleInstance,


    Variable = require("business-data.mod/data/main.mod/model/questionnaire/variable").Variable,
    Answer = require("business-data.mod/data/main.mod/model/questionnaire/answer").Answer,
    Questionnaire = require("business-data.mod/data/main.mod/model/questionnaire/questionnaire").Questionnaire,
    Question = require("business-data.mod/data/main.mod/model/questionnaire/question").Question,
    QuestionnaireQuestion = require("business-data.mod/data/main.mod/model/questionnaire/questionnaire-question").QuestionnaireQuestion,
    RespondentQuestionnaire = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire").RespondentQuestionnaire,
    RespondentQuestionnaireVariableValue = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-variable-value").RespondentQuestionnaireVariableValue,
    RespondentQuestionnaireAnswer = require("business-data.mod/data/main.mod/model/questionnaire/respondent-questionnaire-answer").RespondentQuestionnaireAnswer,

    STAFF_TYPE_ORIGIN_ID_RANGE_START = 1000000,

    PlummingIntakeDataService;

    const PATH = require("path");
    const fs = require('fs');


/**
 * Defines a raw dataservice that receives data operations from an external data source 
 * with the raw data model as descrived by object descriptors here. 
 * 
 * The operations, create/update/delete as batch or self contained need to be converted 
 * to Phront's schema, and become changes in the main data service. 
 * 
 * When the conversion is over processing all operations, we'll get saveChanges called on
 * the main service which will get things where they need to go in the right phront database.
 *
 * @class
 * @extends external:RawDataService - or we might need a RawDataOperationService super class?
 */


 /**
 * Conversion Notes
 * 
 * - Patient's contact info should go in contactInformation's proeprty of Person, 
 * while account_holders' equivalent info should go on the contactInformation property of
 * the the B2CCustomerSupplierRelationship that models the account relationship with the practice.
 * 
 * - staff_members.
 * we're going to create a person, and an employement relationship with the practice.
 * 
 * - be on the look for appointments that wouldn't have an orthodontistId
 * - practiceId will be integer, but unique
 * - We get a new Practice type
 * - id+name
 * - we add practice_id in Location_types
 * 
 */

 /**
* TODO: Document
*
* @class
* @extends RawDataService
*/
exports.PlummingIntakeDataService = PlummingIntakeDataService = RawDataService.specialize(/** @lends PlummingIntakeDataService.prototype */ {
    constructor: {
        value: function PlummingIntakeDataService() {
            this.super();

            // this.addEventListener(DataOperation.Type.CreateTransactionOperation,this,false);
            // this.addEventListener(DataOperation.Type.BatchOperation,this,false);
            // this.addEventListener(DataOperation.Type.MergeOperation,this,false);
            // this.addEventListener(DataOperation.Type.DeleteOperation,this,false);
            // this.addEventListener(DataOperation.Type.CommitTransactionOperation,this,false);

            this._deserializer = new Deserializer();

            var cache = this.application.cache;
            this._createTransactionOperationPromiseById = cache.get("createTransactionOperationPromiseById");
            if(!this._createTransactionOperationPromiseById) {
                this._createTransactionOperationPromiseById = new Map();
                cache.set("createTransactionOperationPromiseById", this._createTransactionOperationPromiseById);
            }
            
            this._pendingCreateTransactionOperationById = cache.get("pendingCreateTransactionOperationById");
            if(!this._pendingCreateTransactionOperationById) {
                this._pendingCreateTransactionOperationById = new Map();
                cache.set("pendingCreateTransactionOperationById", this._pendingCreateTransactionOperationById);
            }

            this._operationPromisesByCreateTransactionOperationId = cache.get("operationPromisesByCreateTransactionOperationId");
            if(!this._operationPromisesByCreateTransactionOperationId) {
                this._operationPromisesByCreateTransactionOperationId = new Map();
                cache.set("operationPromisesByCreateTransactionOperationId", this._operationPromisesByCreateTransactionOperationId);
            }

            return this;
        }
    },

    /*
        Looks like OperationCoordinator, whose place/role in the Worker's might change  doesn't listen to CommitTransactionOperation on mainService, so we're doing like PhrontService and getting it directly
    */
    addMainServiceEventListeners: {
        value: function() {
            this.super();
            this.mainService.addEventListener(DataOperation.Type.PerformTransactionOperation,this,false);
            this.mainService.addEventListener(DataOperation.Type.AppendTransactionOperation,this,false);
            this.mainService.addEventListener(DataOperation.Type.CommitTransactionOperation,this,false);
            this.mainService.addEventListener(DataOperation.Type.RollbackTransactionOperation,this,false);
        }

    },

    _createTransactionOperationPromiseById: {
        value: undefined
    },

    _pendingCreateTransactionOperationById: {
        value: undefined
    },

    _operationPromisesByCreateTransactionOperationId: {
        value: undefined
    },

    _transactionProcessingQueue: {
        value: undefined
    },

    createEventRoleWithNameAndTags: {
        value: function createEventRoleWithNameAndTags(name, tags, locales) {
            //console.log("PlummingIntakeDataService -createEventRoleWithNameAndTags ["+name.en["*"]+"]");
            var role = this.rootService.createDataObject(Role);
        
            role.locales = locales;
        
            role.name = name;
            if(tags) role.tags = tags;
        
            return this.rootService.saveChanges().then((operation) => {

                //console.log("PlummingIntakeDataService -createEventRoleWithNameAndTags ["+name.en["*"]+"] DONE");

                /*
                    When just created, the role's name might be a object if there were more than 1 locale in locales. We don't have yet the logic to reset
        
                    role.locales = [locales[0]];
        
                    Which should internally do what we want without considering it a change at the DataTrigger level. the easiest for now might be to re-fetch it :-(
                */
                //return role;
                return this.eventRoleWithNameAndTags(name, tags, locales);
            });
        }
    },
    
    eventRoleWithNameAndTags: {
        value: function eventRoleWithNameAndTags(name, tags, locales) {
            //console.log("PlummingIntakeDataService -eventRoleWithNameAndTags ["+name.en["*"]+"]");
            /*
                Role name sample:
                "{"en":{"*":"organizer","CA":"organizeur"},"fr":{"*":"organisateur","CI":"l’organisateur","PF":"organisateur"}}"
            */
        
        var firstLocale = locales[0],
                localizedNameEntry = name[firstLocale.language],
                nameValue = localizedNameEntry && (localizedNameEntry[firstLocale.region] || localizedNameEntry["*"]),
                criteria;
        
            if(!nameValue) {
                throw "Can't find an event role without a name";
            }
        
            criteria = new Criteria().initWithExpression("name == $.name", {
                name: nameValue
            });
        
            var query = DataQuery.withTypeAndCriteria(Role, criteria);
        
            return this.rootService.fetchData(query)
            .then((result) => {
                if(!result || result.length === 0) {
                    return this.createEventRoleWithNameAndTags(name, tags, locales);
                } else {
                    //console.log("PlummingIntakeDataService -eventRoleWithNameAndTags ["+name.en["*"]+"] Fetched!");
                    return result[0];
                }
            }, (error) => {
                console.log("PlummingIntakeDataService -eventRoleWithNameAndTags ["+name.en["*"]+"] error:",error);
                if(error.message.indexOf('.Role" does not exist') !== -1) {
                        //We need to find a way expose the creation of a object descriptor's storage
                        //to the main data service.

                        return Promise.all([
                            this.rootService.createStorageForObjectDescriptor(this.rootService.objectDescriptorForType(Role))
                        ]).then(() => {
                            return this.createEventRoleWithNameAndTags(name, tags, locales);
                        });
                    }
                    else {
                        return Promise.reject(error);
                    }
            });
        
        }
    },

    roleLocales: {
        value: [englishLocale,frenchLocale]
    },

    eventOrganizerRole: {
        value: undefined
    },
    _eventOrganizerRolePromise: {
        value: undefined
    },
    eventOrganizerRolePromise: {
        get: function eventOrganizerRolePromise() {
            return (this._eventOrganizerRolePromise || (this._eventOrganizerRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Organisateur"
                },
                "en": {
                    "*":"Organizer"
                }
            }, {
                "fr": {
                    "*":["Rendez-vous","Meeting","Reunion","Session de travail"]
                },
                "en": {
                    "*":["Appointment","Meeting","Work Session"]
                }
            }, this.roleLocales
            )))
            .then((role) => {
                this.eventOrganizerRole = role;
                return role;
            });
        }
    },
    
    eventAttendeeRole: {
        value: undefined
    },
    _eventAttendeeRolePromise: {
        value: undefined
    },
    eventAttendeeRolePromise: {
        get: function eventAttendeeRolePromise() {
            return (this._eventAttendeeRolePromise || (this._eventAttendeeRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Participant"
                },
                "en": {
                    "*":"Attendee"
                }
            }, {
                "fr": {
                    "*":["Rendez-vous","Meeting","Reunion","Session de travail"]
                },
                "en": {
                    "*":["Appointment","Meeting","Work Session"]
                }
            }, this.roleLocales
            )))
            .then((role) => {
                this.eventAttendeeRole = role;
                return role;
            });

        }
    },
    
    patientRole: {
        value: undefined
    },
    _patientRolePromise: {
        value: undefined
    },
    patientRolePromise: {
        get: function patientRolePromise() {
            return this._patientRolePromise || (this._patientRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Patient"
                },
                "en": {
                    "*":"Patient"
                }
            },null, this.roleLocales
            )
            .then((role) => {
                this.patientRole = role;
                return role;
            }));
        }
    },
    
    financialResponsibilityRole: {
        value: undefined
    },
    _financialResponsibilityRolePromise: {
        value: undefined
    },
    financialResponsibilityRolePromise: {
        get: function financialResponsibilityRolePromise() {
            return (this._financialResponsibilityRolePromise || (this._financialResponsibilityRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Responsabilité financière"
                },
                "en": {
                    "*":"Financial Responsibility"
                }
            },null, this.roleLocales
            )))
            .then((role) => {
                this.financialResponsibilityRole = role;
                return role;
            });
        }
    },

    customerPreferenceRole: {
        value: undefined
    },
    _customerPreferenceRolePromise: {
        value: undefined
    },
    customerPreferenceRolePromise: {
        get: function customerPreferenceRolePromise() {
            return (this._customerPreferenceRolePromise || (this._customerPreferenceRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Préférence client"
                },
                "en": {
                    "*":"Customer Preference"
                }
            },null, this.roleLocales
            )))
            .then((role) => {
                this.customerPreferenceRole = role;
                return role;
            });
        }
    },

    emergencyContactRole: {
        value: undefined
    },
    _emergencyContactRolePromise: {
        value: undefined
    },
    emergencyContactRolePromise: {
        get: function emergencyContactRolePromise() {
            return (this._emergencyContactRolePromise || (this._emergencyContactRolePromise = this.eventRoleWithNameAndTags({
                "fr": {
                    "*":"Personne à contacter en cas d'urgence"
                },
                "en": {
                    "*":"Emergency Contact"
                }
            },null, this.roleLocales
            )))
            .then((role) => {
                this.emergencyContactRole = role;
                return role;
            });
        }
    },


    _debugServiceProductVariant: {
        value: function(createTransactionOperation) {
            var self = this,
                mainService = this.rootService,
                serviceObjectDescriptor = mainService.objectDescriptorForType(Service);

            return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(serviceObjectDescriptor, "4e20d237-8f37-4471-bfac-01bf2667b383", createTransactionOperation).then((procedureService) => {

                    console.log(procedureService);
                    return null;
            })
            .then(function() {
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(serviceObjectDescriptor, "4e20d237-8f37-4471-bfac-01bf2667b383", createTransactionOperation,null,["variants"]).then((procedureService) => {

                    console.log(procedureService);
                    return null;
            });
    
            });


        }
    },

    _questionnaireByName: {
        value: new Map()
    },
    questionnaireWithName: {
        value: function(questionnaireName) {

            if(this._questionnaireByName.has(questionnaireName)) {
                return Promise.resolve(this._questionnaireByName.get(questionnaireName));
            } else {
                var self = this,
                    mainService = this.rootService,
                    objectDescriptor = mainService.objectDescriptorForType(Questionnaire);

                /* First, make sure the table exists: */
                return this._createObjectDescriptorStoreForTypeIfNeeded(objectDescriptor)
                .then(function(wasCreated) {

                    //console.log("questionnaireWithName - (1)");
                    //If it was just created, it's empty...
                    if(wasCreated) {
                        // console.log("questionnaireWithName - (2)");
                        return null;
                    } else {
                        /*
                            Second, fetch the row to see if it exists:
                        */
                        var nameCriteria = new Criteria().initWithExpression("name == $.name", {
                                name: questionnaireName
                            }),
                            objectQuery = DataQuery.withTypeAndCriteria(objectDescriptor, nameCriteria);

                        // if(readExpressions) {
                        //     objectQuery.readExpressions = readExpressions;
                        //     if(readExpressions.indexOf("originId") === -1) {
                        //         readExpressions.push("originId");
                        //     }
                        // }
                        //console.log("PlummingIntakeDataService -questionnaireWithNamefetchData");
                        //console.log("questionnaireWithName - (3)");
                        return self.rootService.fetchData(objectQuery);

                    }
                })
                .then(function(result) {
                    //console.log("questionnaireWithName - (4)");
                    //console.log("PlummingIntakeDataService -questionnaireWithName fetchData then");
                    if(result && result.length === 1) {
                        self._questionnaireByName.set(questionnaireName, Promise.resolve(result[0]));
                        //console.log("questionnaireWithName - (5)");
                        return result[0]; 
                    }  if(result && result.length > 1) {
                        throw "More than one questionnaire named '"+questionnaireName+"' was found";
                    } else {
                        //console.log("questionnaireWithName - (6)");
                        return null;
                    }
                });

            }
        }
    },

    _customerEngagementQuestionnaireByName: {
        value: new Map()
    },

    /*
        returns an organization's existing customerEngagementQuestionnaire for that questionnaire's name
        or creates it.
    */
    customerEngagementQuestionnaireWithNameForOrganization: {
        value: function(questionnaireName, organization, propertyNames) {

            // if(this._customerEngagementQuestionnaireByName.has(questionnaireName)) {
            //     return Promise.resolve(this._customerEngagementQuestionnaireByName.get(questionnaireName));
            // } else {
                var self = this,
                    mainService = this.rootService,
                    customerEngagementQuestionnairesPromise;

                /*
                    Check if we're dealing with a freshly created organization or one we fetched
                */
                if(!mainService.isObjectCreated(organization)) {
                    customerEngagementQuestionnairesPromise = mainService.getObjectProperties(organization, "customerEngagementQuestionnaires")
                    .then(function() {
                        if(propertyNames) {
                            return mainService.getObjectsProperties(organization.customerEngagementQuestionnaires, propertyNames)
                            .then(function() {
                                return organization.customerEngagementQuestionnaires;
                            })
                        } else {
                            return organization.customerEngagementQuestionnaires;
                        }
                    });
                } else {
                    customerEngagementQuestionnairesPromise = Promise.resolve(organization.customerEngagementQuestionnaires);
                }

                return customerEngagementQuestionnairesPromise
                .then(function(customerEngagementQuestionnaires) {

                    /*
                        Make sure we have the quesstionnaire relationship populated before we filter:
                    */
                    if(customerEngagementQuestionnaires && !mainService.isObjectCreated(organization)) {
                        return mainService.getObjectsProperties(customerEngagementQuestionnaires, "questionnaire")
                        .then(function() {
                            return customerEngagementQuestionnaires;
                        });
                    } else {
                        return customerEngagementQuestionnaires;
                    }
                })
                .then(function(customerEngagementQuestionnaires) {

                    var nameCriteria = new Criteria().initWithExpression("questionnaire.name == $.name", {
                            name: questionnaireName
                        }),
                        filteredCustomerEngagementQuestionnaires,
                        customerEngagementQuestionnaire;
    
    
                    filteredCustomerEngagementQuestionnaires = customerEngagementQuestionnaires ? customerEngagementQuestionnaires.filter(nameCriteria.predicateFunction) : null;
                    if(filteredCustomerEngagementQuestionnaires && filteredCustomerEngagementQuestionnaires.length) {
                        if(filteredCustomerEngagementQuestionnaires.length > 1) {
                            throw "More than one customerEngagementQuestionnaire for questionnaire named: '"+questionnaireName+"'";
                        }
                        customerEngagementQuestionnaire = filteredCustomerEngagementQuestionnaires[0];
                        return customerEngagementQuestionnaire;
                    } else {
                        //We create the customerEngagementQuestionnaires for the organization:
                        return self.createCustomerEngagementQuestionnaireWithNameForOrganization(questionnaireName, organization);
                    }
                });
            //}
        }    
    },

    createCustomerEngagementQuestionnaireWithNameForOrganization: {
        value: function(questionnaireName, organization) {
            var self = this;
            return this.questionnaireWithName(questionnaireName)
            .then(function(questionnaire) {

                if(!questionnaire) {
                    throw "questionnaire with name '"+questionnaireName+"' not found, was expected to be created already";
                }
                
                var mainService = self.rootService,

                //Create the CustomerEngagementQuestionnaire if it wasn't found:
                customerEngagementConsentQuestionnaire = mainService.createDataObject(CustomerEngagementQuestionnaire);
                customerEngagementConsentQuestionnaire.organization = organization;
                customerEngagementConsentQuestionnaire.questionnaire = questionnaire;
                // return mainService.saveChanges()
                // .then(function() {
                    return customerEngagementConsentQuestionnaire;
                // }, function(error) {
                //     console.error(error);
                //     return Promise.reject(error);
                // });

            });

        }
    },

    consentQuestionnaireName: {
        value: "AAOIC Consent Questionnaire"
    },

    supplementalHealthQuestionnaireName: {
        value: "AAOIC Supplemental Health Questionnaire"
    },

    checkInQuestionnaire: {
        value: function() {
            var self = this,
                mainService = this.rootService,
                consentQuestionnaireName = this.consentQuestionnaireName,
                questionnaireTitle = "AAOIC SUPPLEMENTAL INFORMED CONSENT";
                questionnaireSubtitle = "Orthodontic Treatment in the Era of COVID-19";

            //console.log("PlummingIntakeDataService -checkInQuestionnaire");

            return this.questionnaireWithName(consentQuestionnaireName)
            .then(function(questionnaire) {
                //console.log("PlummingIntakeDataService -checkInQuestionnaire then #1");
                var  supplementalHealthQuestionnaireName = self.supplementalHealthQuestionnaireName,
                supplementalHealthQuestionnaireTitle = "AAOIC Supplemental Health Questionnaire",
                supplementalHealthQuestionnaire;


                if(!questionnaire) {
                    // console.log("PlummingIntakeDataService -checkInQuestionnaire then #1.1");
                    return Promise.all([
                        self._createObjectDescriptorStoreForTypeIfNeeded(Event),
                        self._createObjectDescriptorStoreForTypeIfNeeded(Asset),
                        self._createObjectDescriptorStoreForTypeIfNeeded(Variable),
                        self._createObjectDescriptorStoreForTypeIfNeeded(Answer),
                        self._createObjectDescriptorStoreForTypeIfNeeded(Question),
                        self._createObjectDescriptorStoreForTypeIfNeeded(QuestionnaireQuestion),
                        self._createObjectDescriptorStoreForTypeIfNeeded(RespondentQuestionnaire),
                        self._createObjectDescriptorStoreForTypeIfNeeded(RespondentQuestionnaireVariableValue),
                        self._createObjectDescriptorStoreForTypeIfNeeded(RespondentQuestionnaireAnswer),
                        self._createObjectDescriptorStoreForTypeIfNeeded(CustomerEngagementQuestionnaire),
                    ])
                    .then(() => {
                        //console.log("PlummingIntakeDataService -checkInQuestionnaire then #1.2");


                        /*
                            Variables
                        */

                        var ipv4Variable,
                            ipv6Variable,
                            userAgentVariable,
                            submissionDateVariable,
                            signatureFileVariable,
                            signatureCaptionVariable;


                        ipv4Variable = mainService.createDataObject(Variable);
                        ipv4Variable.locales = [englishLocale];
                        ipv4Variable.name = "ipv4";
                        ipv4Variable.displayName = "user's IP address version 4";

                        ipv6Variable = mainService.createDataObject(Variable);
                        ipv6Variable.name = "ipv6";
                        ipv6Variable.displayName = "user's IP address version 6";

                        userAgentVariable = mainService.createDataObject(Variable);
                        userAgentVariable.name = "userAgent";
                        userAgentVariable.displayName = "userAgent of user's browser";

                        submissionDateVariable = mainService.createDataObject(Variable);
                        submissionDateVariable.name = "submissionDate";
                        submissionDateVariable.displayName = "Date the user submitted the form";

                        signatureFileVariable = mainService.createDataObject(Variable);
                        signatureFileVariable.name = "signatureFile";
                        signatureFileVariable.displayName = "The name of question asking for signature";

                        signatureCaptionVariable = mainService.createDataObject(Variable);
                        signatureCaptionVariable.name = "signatureCaption";
                        signatureCaptionVariable.displayName = "The caption around the signature input";


                        /*
                            Answers
                        */
                        var yesAnswer = mainService.createDataObject(Answer);
                        yesAnswer.name = "Yes";
                        yesAnswer.textValue = "Yes";
                        yesAnswer.booleanValue = true;

                        var noAnswer = mainService.createDataObject(Answer);
                        noAnswer.name = "No";
                        noAnswer.textValue = "No";
                        noAnswer.booleanValue = false;


                        /*
                            Questionnaire, Questions, QuestionnaireQuestions....
                        */


                        questionnaire = mainService.createDataObject(Questionnaire);
                        questionnaire.locales = [englishLocale];
                        questionnaire.name = consentQuestionnaireName;
                        questionnaire.title = questionnaireTitle;
                        questionnaire.subtitle = questionnaireSubtitle;
                        
                        questionnaire.description = `Thank you for your continued trust in our practice. As with the transmission of any communicable disease like a cold or the flu, you may be exposed to COVID-19, also known as “Coronavirus,” at any time or in any place. Be assured that we have always followed state and federal regulations and recommended universal personal protection and disinfection protocols to limit transmission of all diseases in our office and continue to do so.
                        Despite our careful attention to sterilization, disinfection, and use of personal barriers, there is still a chance that you could be exposed to an illness in our office, just as you might be at your gym, grocery store, or favorite restaurant. “Social Distancing” nationwide has reduced the transmission of the Coronavirus. Although we have taken measures to provide social distancing in our practice, due to the nature of the procedures we provide, it is not possible to maintain social distancing between the patient, orthodontist, orthodontic staff and sometimes other patients at all times.`;
                        questionnaire.userContextVariables = [ipv4Variable, ipv6Variable, userAgentVariable, submissionDateVariable, signatureFileVariable, signatureCaptionVariable];

                        
                        var consentQuestion = mainService.createDataObject(Question);
                        consentQuestion.isOpenEnded = false;
                        consentQuestion.text = "Although exposure is unlikely, do you accept the risk and consent to treatment?";
                        consentQuestion.name = "acceptsConsent";

                        var consentQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        consentQuestionnaireQuestion.questionnaire = questionnaire;
                        consentQuestionnaireQuestion.question = consentQuestion;
                        consentQuestionnaireQuestion.questionnairePosition = 1;
                        consentQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var patientFirstNameQuestion = mainService.createDataObject(Question);
                        patientFirstNameQuestion.isOpenEnded = true;
                        patientFirstNameQuestion.text = "Patient First Name";
                        patientFirstNameQuestion.name = "firstName";

                        var patientFirstNameQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        patientFirstNameQuestionnaireQuestion.questionnaire = questionnaire;
                        patientFirstNameQuestionnaireQuestion.question = patientFirstNameQuestion;
                        patientFirstNameQuestionnaireQuestion.questionnairePosition = 2;


                        var patientLastNameQuestion = mainService.createDataObject(Question);
                        patientLastNameQuestion.isOpenEnded = true;
                        patientLastNameQuestion.text = "Patient Last Name";
                        patientLastNameQuestion.name = "lastName";

                        var patientLastNameQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        patientLastNameQuestionnaireQuestion.questionnaire = questionnaire;
                        patientLastNameQuestionnaireQuestion.question = patientLastNameQuestion;
                        patientLastNameQuestionnaireQuestion.questionnairePosition = 3;


                        var dateQuestion = mainService.createDataObject(Question);
                        dateQuestion.isOpenEnded = true;
                        dateQuestion.text = "Date";
                        dateQuestion.name = "acceptationDate";

                        var dateQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        dateQuestionnaireQuestion.questionnaire = questionnaire;
                        dateQuestionnaireQuestion.question = dateQuestion;
                        dateQuestionnaireQuestion.questionnairePosition = 4;


                        var patientParentSignatureQuestion = mainService.createDataObject(Question);
                        patientParentSignatureQuestion.isOpenEnded = true;
                        patientParentSignatureQuestion.text = "Patient/Parent’s Signature";
                        patientParentSignatureQuestion.name = "acceptsSignature";

                        var patientParentSignatureQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        patientParentSignatureQuestionnaireQuestion.questionnaire = questionnaire;
                        patientParentSignatureQuestionnaireQuestion.question = patientParentSignatureQuestion;
                        patientParentSignatureQuestionnaireQuestion.questionnairePosition = 5;


                        /*
                            Now create the Supplemental Health Questionnaire
                        */
                       supplementalHealthQuestionnaire = mainService.createDataObject(Questionnaire);
                       supplementalHealthQuestionnaire.locales = [englishLocale];
                       supplementalHealthQuestionnaire.name = supplementalHealthQuestionnaireName;
                       supplementalHealthQuestionnaire.title = supplementalHealthQuestionnaireTitle;
                       supplementalHealthQuestionnaire.description = 'If you have been exposed to a communicable disease, you may spread the disease to the orthodontist, orthodontic staff, or other patients/parents in the practice. Therefore, prior to each appointment, we will be asking the following questions to reduce the chances of transmission:';

                       supplementalHealthQuestionnaire.userContextVariables = [signatureFileVariable, signatureCaptionVariable];


                       //Tentative
                       supplementalHealthQuestionnaire.referrerQuestionnaire = questionnaire;


                        var responsiblePartyQuestion = mainService.createDataObject(Question);
                        responsiblePartyQuestion.isOpenEnded = true;
                        responsiblePartyQuestion.text = "Responsible Party";
                        responsiblePartyQuestion.name = "responsibleParty";

                        var responsiblePartyQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        responsiblePartyQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        responsiblePartyQuestionnaireQuestion.question = responsiblePartyQuestion;
                        responsiblePartyQuestionnaireQuestion.questionnairePosition = 1;


                        var positiveCovidQuestion = mainService.createDataObject(Question);
                        positiveCovidQuestion.isOpenEnded = false;
                        positiveCovidQuestion.text = `Have you, your child, or others accompanying you to today’s appointment or other recent acquaintances tested positive for or been diagnosed as having COVID-19 or any other communicable disease?`;
                        positiveCovidQuestion.name = "positiveCovid";

                        var positiveCovidQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        positiveCovidQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        positiveCovidQuestionnaireQuestion.question = positiveCovidQuestion;
                        positiveCovidQuestionnaireQuestion.questionnairePosition = 2;
                        positiveCovidQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var lastPositiveCovidDateQuestion = mainService.createDataObject(Question);
                        lastPositiveCovidDateQuestion.isOpenEnded = true;
                        lastPositiveCovidDateQuestion.text = `If yes, when? Date`;
                        lastPositiveCovidDateQuestion.name = "lastPositiveCovidDate";

                        var lastPositiveCovidDateQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        lastPositiveCovidDateQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        lastPositiveCovidDateQuestionnaireQuestion.question = lastPositiveCovidDateQuestion;
                        lastPositiveCovidDateQuestionnaireQuestion.questionnairePosition = 3;


                        var symptomGroupQuestion = mainService.createDataObject(Question);
                        symptomGroupQuestion.isOpenEnded = false;
                        symptomGroupQuestion.text = `Do you, your child, or others accompanying you to today’s appointment or other recent acquaintances have:`;
                        symptomGroupQuestion.name = "symptomGroup";

                        var symptomGroupQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        symptomGroupQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        symptomGroupQuestionnaireQuestion.question = symptomGroupQuestion;
                        symptomGroupQuestionnaireQuestion.questionnairePosition = 4;


                        var feverQuestion = mainService.createDataObject(Question);
                        feverQuestion.superQuestion = symptomGroupQuestion;
                        feverQuestion.isOpenEnded = false;
                        feverQuestion.text = `A Fever? (defined as above 99.6 degrees)`;
                        feverQuestion.name = "fever";

                        var feverQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        feverQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        feverQuestionnaireQuestion.question = feverQuestion;
                        feverQuestionnaireQuestion.questionnairePosition = 5;
                        feverQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var coughQuestion = mainService.createDataObject(Question);
                        coughQuestion.superQuestion = symptomGroupQuestion;
                        coughQuestion.isOpenEnded = false;
                        coughQuestion.text = `A Cough?`;
                        coughQuestion.name = "cough";

                        var coughQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        coughQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        coughQuestionnaireQuestion.question = coughQuestion;
                        coughQuestionnaireQuestion.questionnairePosition = 6;
                        coughQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var breathingIssuesQuestion = mainService.createDataObject(Question);
                        breathingIssuesQuestion.superQuestion = symptomGroupQuestion;
                        breathingIssuesQuestion.isOpenEnded = false;
                        breathingIssuesQuestion.text = `Shortness of Breath and/or Trouble Breathing?`;
                        breathingIssuesQuestion.name = "breathingIssues";

                        var breathingIssuesQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        breathingIssuesQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        breathingIssuesQuestionnaireQuestion.question = breathingIssuesQuestion;
                        breathingIssuesQuestionnaireQuestion.questionnairePosition = 7;
                        breathingIssuesQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var chestPainQuestion = mainService.createDataObject(Question);
                        chestPainQuestion.superQuestion = symptomGroupQuestion;
                        chestPainQuestion.isOpenEnded = false;
                        chestPainQuestion.text = `Persistent Pain, Pressure, or Tightness in the Chest?`;
                        chestPainQuestion.name = "chestPain";

                        var chestPainQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        chestPainQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        chestPainQuestionnaireQuestion.question = chestPainQuestion;
                        chestPainQuestionnaireQuestion.questionnairePosition = 8;
                        chestPainQuestionnaireQuestion.possibleAnswers = [yesAnswer,noAnswer];


                        var acceptsRescheduleIfSickQuestion = mainService.createDataObject(Question);
                        acceptsRescheduleIfSickQuestion.isOpenEnded = true;
                        acceptsRescheduleIfSickQuestion.text = `I understand that if the answer to any of these questions is yes, I will be asked to reschedule today’s orthodontic appointment.

                        Patient/Parent’s Signature`;
                        acceptsRescheduleIfSickQuestion.name = "acceptsRescheduleIfSick";

                        acceptsRescheduleIfSickQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        acceptsRescheduleIfSickQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        acceptsRescheduleIfSickQuestionnaireQuestion.question = acceptsRescheduleIfSickQuestion;
                        acceptsRescheduleIfSickQuestionnaireQuestion.questionnairePosition = 9;


                        var supplementalHealthDateQuestionnaireQuestion = mainService.createDataObject(QuestionnaireQuestion);
                        supplementalHealthDateQuestionnaireQuestion.questionnaire = supplementalHealthQuestionnaire;
                        supplementalHealthDateQuestionnaireQuestion.question = dateQuestion;
                        supplementalHealthDateQuestionnaireQuestion.questionnairePosition = 10;

                        //console.log("PlummingIntakeDataService -checkInQuestionnaire then #1.3 saveChanges()");
                        return mainService.saveChanges();
                    })
                    .then(() => {
                        //console.log("PlummingIntakeDataService -checkInQuestionnaire then #1.3 saveChanges DONE!");
                        self._questionnaireByName.set(consentQuestionnaireName, questionnaire);
                        self._questionnaireByName.set(supplementalHealthQuestionnaireName, supplementalHealthQuestionnaire);

                        return questionnaire;
                    })
                    .catch((error) => {
                        console.log("PlummingIntakeDataService -checkInQuestionnaire saveChanges() error",error);
                        return error;
                    });
                } else {
                    return Promise.resolve(questionnaire);
                }
            });
        }
    },

    supplementalHealthQuestionnaire: {
        value: function() {
            var self = this,
                mainService = this.rootService,
                questionnaire,
                questionnaireName = "AAOIC Supplemental Health Questionnaire",
                questionnaireTitle = "AAOIC SUPPLEMENTAL INFORMED CONSENT Orthodontic Treatment in the Era of COVID-19";

            this.questionnaireWithName(questionnaireName)
            .then(function(questionnaire) {
                if(!questionnaire) {
                    


                    self._questionnaireByName.set(questionnaireName, questionnaire);
                }

                return questionnaire;
            });
        }
    },

    registerCreateTransactionDataObject: {
        value: function(createTransactionOperation, dataObject) {
            var dataObjectDescriptor = this.rootService.objectDescriptorForObject(dataObject),
                transactionDataObjectsByOriginId = createTransactionOperation.dataObjectsByOriginId,
                typeMap = transactionDataObjectsByOriginId.get(dataObjectDescriptor);

            if(!typeMap) {
                transactionDataObjectsByOriginId.set(dataObjectDescriptor,(typeMap = new Map()));
            }

            typeMap.set(dataObject.originId.toString(), dataObject);

            /*
                Hard coding logic for now about the type we're keeping around because they get reused a lot:
            */
            // if(dataObjectDescriptor.name === "Organization" ||
            // dataObjectDescriptor.name === "Person" ) {
            //     typeMap = this._dataObjectsByOriginId.get(dataObjectDescriptor);

            //     if(!typeMap) {
            //         this._dataObjectsByOriginId.set(dataObjectDescriptor,(typeMap = new Map()));
            //     }
    
            //     typeMap.set(dataObject.originId.toString(), dataObject);
            // }
        }
    },

    _dataObjectsByOriginId: {
        value: new Map()
    },

    registeredDataObjectForTypeOriginIdInCreateTransaction: {
        value: function(type, originId, createTransactionOperation) {
            var dataObjectDescriptor = this.rootService.objectDescriptorForType(type),
                transactionDataObjectsByOriginId = createTransactionOperation.dataObjectsByOriginId,
                typeMap = transactionDataObjectsByOriginId.get(dataObjectDescriptor),
                registeredDataObject;
            
            if(typeMap) {
                registeredDataObject = typeMap.get(originId.toString());
            }

            if(!registeredDataObject) {
                if(typeMap = this._dataObjectsByOriginId.get(dataObjectDescriptor)) {
                    registeredDataObject = typeMap.get(originId.toString());
                }
            }

            return registeredDataObject;
        }
    },

    _setupCreateTransactionOperation: {
        value: function (createTransactionOperation) {
            this._pendingCreateTransactionOperationById.set(createTransactionOperation.id,createTransactionOperation);
            createTransactionOperation.batchOperations = [];
            createTransactionOperation.processedBatchOperations = new Set();

            //Create the local indexes:
            createTransactionOperation.dataObjectsByOriginId = new Map();
            createTransactionOperation.rawDataObjectsByTypeByOriginId = new Map();
            createTransactionOperation.operationsByOriginId = new Map();
            
            //this._transactionProcessingQueue.unshift(createTransactionOperation);

            var commitTransactionPromise = new Promise(function(resolve, reject) {
                createTransactionOperation.promiseCallbacks = [resolve, reject];
            });

            //Set it at the beginning of the chain
            this._operationPromisesByCreateTransactionOperationId.set(createTransactionOperation.id, [commitTransactionPromise]);


            this._createTransactionOperationPromiseById.set(createTransactionOperation.id, commitTransactionPromise);
        }
    },

    handleCreateTransactionOperation: {
        value: function (createTransactionOperation) {
            //console.log("PlummingIntakeDataService -handleCreateTransactionOperation: ",createTransactionOperation);

            var data = createTransactionOperation.data,
                //For a transaction, .data holds an array of objectdescriptors that will be involved in the trabsaction
                transactionObjectDescriptors = createTransactionOperation.data;

            this._setupCreateTransactionOperation(createTransactionOperation);

            var operation = new DataOperation();
            operation.referrerId = createTransactionOperation.id;
            operation.clientId = createTransactionOperation.clientId;

            //We keep the same
            operation.target = createTransactionOperation.target;
            operation.type = DataOperation.Type.CreateTransactionCompletedOperation;
            operation.data = data;

            operation.target.dispatchEvent(operation);

        }
    },

    operationForTypeOriginIdInCreateTransactionOperation: {
        value: function(type, originId, createTransactionOperation) {
            var typeMap = createTransactionOperation.operationsByOriginId.get(type),
                operation;

            if(!typeMap) {
                createTransactionOperation.operationsByOriginId.set(type, (typeMap = new Map()));
            }

            return typeMap.get(originId);
        }
    },

    setOperationForTypeOriginIdInCreateTransactionOperation: {
        value: function(operation, type, originId, createTransactionOperation) {
            var typeMap = createTransactionOperation.operationsByOriginId.get(type);

            if(!typeMap) {
                createTransactionOperation.operationsByOriginId.set(type, (typeMap = new Map()));
            }

            typeMap.set(originId, operation);
        }
    },

    handleMergeOperation: {
        value: function (mergeOperation) {

            /* 
                custom re-routing internally until we get eventmanager to handle smart camel casing of names with separator characters.
            */

            // var operationListenerMethodName = this.methodNameForProcessingOperation(mergeOperation);
            // if(typeof this[operationListenerMethodName] !== "function") {
            //     console.error("Implementation for "+operationListenerMethodName+" is missing");
            //     return Promise.reject( new Error("Implementation for "+operationListenerMethodName+" is missing"));
            // }
            // else {
            //     this[operationListenerMethodName](mergeOperation);
            // }
            


            var referrerId = mergeOperation.referrerId,
                originIdValue = this.originIdValueForOperation(mergeOperation),
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId);

                if(referrerId && !createTransactionOperation) {
                    console.error("Couldn't find createTransactionOperation with referrerId "+referrerId);
                }

                if(createTransactionOperation) {
                    //Add the operation to the batch:
                    createTransactionOperation.batchOperations.push(mergeOperation);
                    this.setOperationForTypeOriginIdInCreateTransactionOperation(mergeOperation,mergeOperation.target, originIdValue, createTransactionOperation);

                    if(createTransactionOperation.clientId) {
                        var operation = new DataOperation();
                        operation.referrerId = mergeOperation.id;
                        operation.clientId = mergeOperation.clientId;
    
                        operation.clientId = mergeOperation.clientId;
                        //We keep the same
                        operation.target = mergeOperation.target;
                        operation.type = DataOperation.Type.TransactionUpdatedOperation;
                        operation.data = {
                            transactionId: referrerId
                        };    

                        operation.target.dispatchEvent(operation);

                    }
        
                } else {
                    return this.invokeMethodProcessingOperation(mergeOperation);
                }

                // var objectDescriptor = mergeOperation.target,
                //     mapping = this.mappingForType(objectDescriptor),
                //     rawDataPrimaryKeys = mapping.rawDataPrimaryKeys,
                //     originIdKey = rawDataPrimaryKeys[0],
                //     originIdValue = mergeOperation.data[originIdKey];
                // var originIdValue = this.originIdValueForOperation(mergeOperation);


        }
    },

    _objectDescriptorStoreExistsCache: {
        value: new Map()
    },
    
    _createObjectDescriptorStoreForTypeIfNeeded: {
        value: function(type) {
            var mainService = this.rootService,
                objectDescriptor = mainService.objectDescriptorForType(type),
                cachedValue = this._objectDescriptorStoreExistsCache.get(objectDescriptor),
                self = this;


            if(cachedValue !== undefined) {
                return Promise.is(cachedValue) ? cachedValue : Promise.resolve(cachedValue);
            } else {

                var query = DataQuery.withTypeAndCriteria(objectDescriptor),
                    queryPromise;
            
                //console.log("PlummingIntakeDataService _createObjectDescriptorStoreForTypeIfNeeded() --> fetchData to see if "+objectDescriptor.name+ " table exists");
            
                query.fetchLimit = 1;
            
                queryPromise =  mainService.fetchData(query)
                .then( (result) => {
                    //console.log("PlummingIntakeDataService _createObjectDescriptorStoreForTypeIfNeeded() --> "+objectDescriptor.name+ " table exists");
                    this._objectDescriptorStoreExistsCache.set(objectDescriptor,false);
                    return false;
                },  (error) => {
                    if((error.message.indexOf('.'+query.type.name+'" does not exist') !== -1)) {
                        //We need to find a way expose the creation of a object descriptor's storage
                        //to the main data service.
                        //console.log("PlummingIntakeDataService phrontClientService.createObjectDescriptorStore() for "+objectDescriptor.name);

                        return mainService.createStorageForObjectDescriptor(mainService.objectDescriptorForType(objectDescriptor))
                        .then(() => {
                            console.log("PlummingIntakeDataService mainService.createStorageForObjectDescriptor() for "+objectDescriptor.name+" COMPLETED!");
                            this._objectDescriptorStoreExistsCache.set(objectDescriptor,true);
                            return true;
                        })
                        .catch((error) => {
                            console.error("PlummingIntakeDataService mainService.createStorageForObjectDescriptor() for "+objectDescriptor.name+" Error!",error);
                            this._objectDescriptorStoreExistsCache.set(objectDescriptor,error);
                            return Promise.reject(error);
                        });
                    }
                    else {
                        this._objectDescriptorStoreExistsCache.set(objectDescriptor,error);
                        return Promise.reject(error);
                    }
                });

                this._objectDescriptorStoreExistsCache.set(objectDescriptor,queryPromise);

                // this._objectDescriptorStoreExistsCache.set(objectDescriptor,queryPromise);
                return queryPromise;
            }

        }
    },
    
    _handleMergeOperation: {
        value: function (mergeOperation) {
            var objectDescriptor = mergeOperation.target,
                mapping = this.mappingForType(objectDescriptor),
                data = mergeOperation.data,
                rawDataPrimaryKeys = mapping.rawDataPrimaryKeys;
            /*
                First, make sure the table exists:
            */
            this._createObjectDescriptorStoreForTypeIfNeeded(objectDescriptor)
            .then(function(wasCreated) {
                /*
                    Second, fetch the row to see if it exists:
                */
               var originIdCriteria = new Criteria().initWithExpression("originId == $.id", {
                    id: rawDataPrimaryKeys[0].toString()
                }),
                objectQuery = DataQuery.withTypeAndCriteria(objectDescriptor, originIdCriteria);
    
                return mainService.fetchData(objectQuery);
    
            });

        }
    },
    handleBatchOperation: {
        value: function (batchOperation) {
            var referrerId = batchOperation.referrerId,
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId);

        }
    },

    handleCommitTransactionOperation: {
        value: function (commitTransactionOperation) {
            return this.handleCommitOrPerformTransactionOperation(commitTransactionOperation);
        }
    },
    handlePerformTransactionOperation: {
        value: function (performTransactionOperation) {
            return this.handleCommitOrPerformTransactionOperation(performTransactionOperation);
        }
    },

    handleCommitOrPerformTransactionOperation: {
        value: function ( transactionOperation/*formerly commitTransactionOperation*/) {
            var self = this,
                isCommitTransactionOperation = (transactionOperation.type ===  DataOperation.Type.CommitTransactionOperation),
                transactionOperationId = transactionOperation.id,
                referrerId = transactionOperation.referrerId,
                clientId = transactionOperation.clientId,
                transactionOperations = transactionOperation.data.operations,
                //Find the matching createTransaction operation:
                createTransactionOperation = this._pendingCreateTransactionOperationById.get((referrerId || transactionOperationId)),
                notifyRelevantChanges,
                operationPropagationPromises,
                operationPropagationPromise;
            
            //console.log("PlummingIntakeDataService.handleCommitOrPerformTransactionOperation()",transactionOperation, "createTransactionOperation: ",createTransactionOperation);
            
            if(isCommitTransactionOperation && !transactionOperations && !createTransactionOperation) {
                /* this is isn't a transaction we're part of */
                return;
            } else if(transactionOperations) {

                /*
                    4/24/2022
                    We're receiving this for a saveChanges in the mainWorker for the provisionning,
                    which shouldn't be the case.

                    Maybe we check and punt if there's no clientId?
                */

                if(!createTransactionOperation) {

                    notifyRelevantChanges = transactionOperation.data.notifyRelevantChanges;

                    /*
                        Workaround, we're going to re-create a minimal one for the sake of getting what we have working. We'll need to refactor later:
                    */
                    createTransactionOperation = new DataOperation();
                    /*
                        If transactionOperation is a commitTransaction, it will have a referrerId, if it's a perform, it won't so we use the transaction's id (stored in transactionOperationId)
                    */
                    createTransactionOperation.id = (referrerId || transactionOperationId);
                    createTransactionOperation.type = DataOperation.Type.CreateTransactionOperation;
                    createTransactionOperation.target = DataService.mainService;
    
                    this._setupCreateTransactionOperation(createTransactionOperation);
                } else {
                    notifyRelevantChanges = createTransactionOperation.data.notifyRelevantChanges;
                }
                /*
                    If there are operations in the transactionOperation, we add them now:

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

                //console.log("transactionOperation.data.operations: ",transactionOperations);
                var keys = Object.keys(transactionOperations),
                    i, countI, iType, iOperations,
                    j, countJ, jType, jOperation,
                    total = 0;

                //console.log("keys: ",keys);
                for(i=0, countI = keys.length; (i<countI); i++) {
                    iType = keys[i];
                    // console.log("iType: ", iType);
                    iOperations = transactionOperations[iType].mergeOperations;

                    //console.log("iOperations: ",iOperations);

                    for(j=0, countJ = iOperations ? iOperations.length : 0; (j<countJ); j++) {
                        jOperation = iOperations[j];
                        // console.log("jOperation: ", jOperation);
                        // console.log("jOperation.target: ", jOperation.target);
                        /*
                            Check the referrerId. If we're in a commitTransacion, the operations have the createTransaction as a referrerId, that might not be ideal, but if we're in a perform, the referer needs to be the performOperation:
                        */
                        if(!isCommitTransactionOperation) {
                            /*
                                Adding it so we can tell the difference in handleMergeOperation between a multi-step transaction and a one-step performTransaction
                            */
                            jOperation.referrer = transactionOperation;
                            jOperation.referrerId = transactionOperationId;
                        }
                        jOperation.target.dispatchEvent(jOperation);
                        total++;
                        if(jOperation.propagationPromise) {
                            (operationPropagationPromises || (operationPropagationPromises = [])).push(jOperation.propagationPromise);
                            //console.log("!!!!!! jOperation.propagationPromise:",jOperation.propagationPromise);
                        }
                    }
                }

                //console.log("transactionOperation.data.operations added: ",total);
            }


            /*
                4/24/2022
                We're receiving this for a saveChanges in the mainWorker for the provisionning,
                which shouldn't be the case.

                Maybe we check and punt if there's no clientId?
            */
           if(total === 0) {
               return;
           }



            var progressListener = function(commitTransactionProgressOperation) {

                /*
                    We're transforming saveChangesProgress in commitTransactionProgress operations as well,
                    so testing for the abscence of clientId allows us to catch only the ones coming from PhrontService
                */
                if(!commitTransactionProgressOperation.clientId) {
                    //Recalibrate the data to 20%+ 0.8 here is the arbitary 80% the past 2 phases represent
                    var lastProgressSent = transactionOperation.lastProgressSent || 0,
                    percentCompletion = (Math.round((0.8+(commitTransactionProgressOperation.data*0.2))*100) / 100);

                    //Throttle, send only if integer level progress.
                    if(percentCompletion > lastProgressSent) {
                        commitTransactionProgressOperation.referrerId = transactionOperationId;
                        commitTransactionProgressOperation.clientId = clientId;   
                        commitTransactionProgressOperation.data = percentCompletion;
                        transactionOperation.lastProgressSent = percentCompletion;
                    }

                    //commitTransactionProgressOperation.target = self;
                    //commitTransactionProgressOperation.target.dispatchEvent(commitTransactionProgressOperation);
                }
            },

            saveChangesProgressListener = function(saveChangesProgressEvent) {
                //Recalibrate the data to 40%+ - 0.4 here is the 40% we already accomplished
                var lastProgressSent = transactionOperation.lastProgressSent || 0,
                percentCompletion = (Math.round((0.4+(saveChangesProgressEvent.detail*0.4))*100) / 100);
                //Throttle, send only if integer level progress.
                if(percentCompletion > lastProgressSent) {
                    //console.log("saveChangesProgressListener: "+percentCompletion);
                    progressOperation = new DataOperation();
                    progressOperation.referrerId = transactionOperation.id;
                    progressOperation.clientId = transactionOperation.clientId;
                    //progressOperation.target = transactionObjectDescriptors;
                    progressOperation.target = this;
                    progressOperation.type = isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionProgressOperation
                        : DataOperation.Type.PerformTransactionProgressOperation;
                    transactionOperation.lastProgressSent = percentCompletion;
                    progressOperation.data = percentCompletion;
                    progressOperation.target.dispatchEvent(progressOperation);    
                }

                //commitTransactionProgressOperation.target = self;
                //commitTransactionProgressOperation.target.dispatchEvent(commitTransactionProgressOperation);
            },
            allOperationsPerformedPromise;


            /*
                This only works if a commitTransaction would end on the same runtime and the cache works
            */
            if(createTransactionOperation && isCommitTransactionOperation) {

                allOperationsPerformedPromise = Promise.all(this._operationPromisesByCreateTransactionOperationId.get((referrerId || transactionOperationId)));
                /*
                    Now resolve the first promise, now that we know there won't be new operations in that transaction, will unlock the promise of processing of each operation handler  
                */
                createTransactionOperation.promiseCallbacks[0]();
            }

            if(operationPropagationPromises) {
                operationPropagationPromise = (operationPropagationPromises.length === 1)
                    ? operationPropagationPromises[0]
                    : Promise.all(operationPropagationPromises);
            } else {
                operationPropagationPromise = Promise.resolve(true);
            }

            operationPropagationPromise
            .then(() => {
                // if(createTransactionOperation && isCommitTransactionOperation) {
                //     console.log("this._processCreateTransaction(",createTransactionOperation,transactionOperation,")");
                    return this._processCreateTransaction(createTransactionOperation, transactionOperation);
                // } else {
                //     return Promise.resolve(true);
                // }
                //allOperationsPerformedPromise    
            //allOperationsPerformedPromise
                //allOperationsPerformedPromise    
            })
            .then(function(resolvedPromises) {
                // console.log("rootService.saveChanges() A");
            /*
                Observe  commitTransactionProgressOperation that will come from PhrontService, so we can add the clientId, which will allow them to be dispatched back to the client.

                !!Important: we listen in capture phase so that progressListener gets called before the operation coordinator gets it, as it's handleEvent looks for a valid clientId to send back on the socket.
            */
                
                //Listener for saveChangesProgress sent by dat service doing saveChanges as it adds to the SQL transaction
                self.rootService.addEventListener(DataEvent.saveChangesProgress,saveChangesProgressListener,true);
                // console.log("rootService.saveChanges() B");

                //Listener for progress sent by PhrontDataService as it adds to the SQL transaction
                self.rootService.addEventListener(
                    isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionProgressOperation
                        : DataOperation.Type.PerformTransactionProgressOperation,
                        progressListener,true);
                // console.log("rootService.saveChanges() C");

                return self.rootService.saveChanges();
            },function(error) {
                console.log("rootService.saveChanges() error:",error);

                self.rootService.removeEventListener(DataEvent.saveChangesProgress,saveChangesProgressListener,true);
                self.rootService.removeEventListener(
                    isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionProgressOperation
                        : DataOperation.Type.PerformTransactionProgressOperation,
                        progressListener,true);

                var operation = new DataOperation();
                operation.referrerId = transactionOperation.id;
                operation.clientId = transactionOperation.clientId;
                operation.type = isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionFailedOperation
                        : DataOperation.Type.PerformTransactionFailedOperation
                operation.target = self;
                operation.data = error;

                //Wether transaction performed or failed, we cleanup
                self._pendingCreateTransactionOperationById.delete((referrerId || transactionOperationId));

                operation.target.dispatchEvent(operation);
            })
            .then(function(transaction) {
                // console.log("rootService.saveChanges() done");

                var hasObjectSaved = (!!transaction.createdDataObjects && transaction.createdDataObjects.size > 0) || (!!transaction.updatedDataObjects && transaction.updatedDataObjects.size > 0) || (!!transaction.deletedDataObjects && transaction.deletedDataObjects.size > 0);

                self.rootService.removeEventListener(DataEvent.saveChangesProgress,saveChangesProgressListener,true);
                self.rootService.removeEventListener(
                    isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionProgressOperation
                        : DataOperation.Type.PerformTransactionProgressOperation,
                    progressListener,true);

                //Check if we need to catchup on progress, if there were no operations to change, we might still be stuck at less than 100%

                if(transactionOperation.lastProgressSent < 1) {
                    var progressOperation = new DataOperation();
                    progressOperation.referrerId = transactionOperation.id;
                    progressOperation.clientId = transactionOperation.clientId;
                    progressOperation.target = self;
                    progressOperation.type = isCommitTransactionOperation 
                        ? DataOperation.Type.CommitTransactionProgressOperation
                        : DataOperation.Type.PerformTransactionProgressOperation;
                    transactionOperation.lastProgressSent = 1;
                    progressOperation.data = 1;
                    progressOperation.target.dispatchEvent(progressOperation);    

                }

                var operation = new DataOperation(),
                    operationType = hasObjectSaved 
                        ? isCommitTransactionOperation 
                            ? DataOperation.Type.CommitTransactionCompletedOperation
                            : DataOperation.Type.PerformTransactionCompletedOperation
                        : DataOperation.Type.NoOp;
                operation.referrerId = transactionOperation.id;
                operation.clientId = transactionOperation.clientId;
                operation.type = operationType;
                operation.target = self;
                operation.data = {};

                var mapIterator,
                    iterationOperation,
                    mapIterationData,
                    mapIterationRawData,
                    setIterator,
                    setIteration,
                    setIterationRawData,
                    mapIteration,
                    summary;

                if(transaction.createdDataObjects) {
                    operation.data.createdDataObjects = summary = {};
                    mapIterator = transaction.createdDataObjects.entries();
                    while ((mapIteration = mapIterator.next().value)) {
                        mapIterationData = summary[mapIteration[0].module.id] = {};
                        mapIterationData.count = mapIteration[1].size;

                        if(notifyRelevantChanges) {
                            mapIterationRawData = mapIterationData.rawData = [];

                            setIterator =  mapIteration[1].values();
                            while (!(setIteration = setIterator.next()).done) {
                                setIterationRawData = transaction.dataOperationsByObject.get(setIteration.value).data;
                                mapIterationRawData.push(setIterationRawData);
                            }    
                        }
                    }   
                    
                    //Add specific handling for returning AppClients info
                    // var appClientObjectDescriptor = self.rootService.objectDescriptorForType(AppClient);
                    // if(transaction.createdDataObjects.has(appClientObjectDescriptor)) {
                    //     summary[appClientObjectDescriptor.module.id].instances = transaction.createdDataObjects.get(appClientObjectDescriptor);
                    // }
                }

                if(transaction.changedDataObjects) {
                    operation.data.changedDataObjects = summary = {};
                    mapIterator = transaction.changedDataObjects.entries();
                    while ((mapIteration = mapIterator.next().value)) {
                        mapIterationData = summary[mapIteration[0].module.id] = {};
                        mapIterationData.count = mapIteration[1].size;

                        if(notifyRelevantChanges) {
                            mapIterationRawData = mapIterationData.rawData = [];

                            setIterator =  mapIteration[1].values();
                            while (!(setIteration = setIterator.next()).done) {
                                setIterationRawData = transaction.dataOperationsByObject.get(setIteration.value).data;
                                mapIterationRawData.push(setIterationRawData);
                            }    
                        }

                    }
                }

                if(transaction.deletedDataObjects) {
                    operation.data.deletedDataObjects = summary = {};
                    mapIterator = transaction.deletedDataObjects.entries();
                    while ((mapIteration = mapIterator.next().value)) {
                        mapIterationData = summary[mapIteration[0].module.id] = {};
                        mapIterationData.count = mapIteration[1].size;

                        if(notifyRelevantChanges) {
                            mapIterationRawData = mapIterationData.rawData = [];

                            setIterator =  mapIteration[1].values();
                            while (!(setIteration = setIterator.next()).done) {
                                setIterationRawData = transaction.dataOperationsByObject.get(setIteration.value).data;
                                mapIterationRawData.push(setIterationRawData);
                            }    
                        }

                    }
                }

                if(operationType === DataOperation.Type.NoOp) {
                    console.log(transactionOperation.type + " "+ transactionOperation.id+ " completed with no changes needed");
                } 
                // else {
                //     console.log(transactionOperation.type + " "+ transactionOperation.id+ " completed as " + operationType);
                // }


                //Wether transaction performed or failed, we cleanup
                self._pendingCreateTransactionOperationById.delete(referrerId);

                operation.target.dispatchEvent(operation);

            },function(error) {
                var operation = new DataOperation();
                operation.referrerId = transactionOperation.id;
                operation.clientId = transactionOperation.clientId;
                operation.type = isCommitTransactionOperation 
                    ? DataOperation.Type.CommitTransactionFailedOperation
                    : DataOperation.Type.PerformTransactionFailedOperation;
                operation.target = self;
                operation.data = error;

                console.log("rootService.saveChanges() failed with error: ", error);

                //Wether transaction performed or failed, we cleanup
                self._pendingCreateTransactionOperationById.delete((referrerId || transactionOperationId));

                operation.target.dispatchEvent(operation);
            });

        }
    },
    _bubbleMethodNameByEventTypeIdentifier_: {
        value: new Map()
    },
    _bubbleMethodNameByEventType_: {
        value: new Map()
    },
    methodNameForProcessingOperationType: {
        enumerable: false,
        value: function methodNameForProcessingOperationType(eventType, identifier, capitalizedEventType, capitalizedIdentifier) {
            var eventTypeBucket,
                methodName,
                _identifier;
            if (identifier) {
                eventTypeBucket = this._bubbleMethodNameByEventTypeIdentifier_.get(eventType) || (this._bubbleMethodNameByEventTypeIdentifier_.set(eventType, new Map())).get(eventType);

                methodName = eventTypeBucket.get(identifier);

                if(!methodName) {
                    var identifierParts = identifier.split("_");

                    for(var i=0, countI = identifierParts.length;(i<countI); i++) {
                        identifierParts[i] = identifierParts[i].toCapitalized();
                    }
                    _identifier = identifierParts.join("");
    
                    methodName =  (eventTypeBucket.set(identifier, ("perform" + (capitalizedIdentifier || _identifier) + (capitalizedEventType || eventType.toCapitalized())))).get(identifier);    
                }
            } 
            
            if(methodName && typeof this[methodName] === "function") {
                return methodName;
            }
            else {
                methodName = this._bubbleMethodNameByEventType_.get(eventType) || (this._bubbleMethodNameByEventType_.set(eventType, ("perform" + (capitalizedEventType || eventType.toCapitalized())))).get(eventType);

                if(methodName && typeof this[methodName] === "function") {
                    return methodName;
                } 
                // else {
                //     console.debug("Couldn't find a method named '"+methodName+"' for "+identifier);
                // }
    
            }

            return null;
        }
    },

    _operationListenerNamesByType: {
        value: new Map()
    },
    methodNameForProcessingOperation: {
        value: function(operation) {
            return  this.methodNameForProcessingOperationType(operation.type, operation.target.name); 
        }
    },

    originIdValueForOperation: {
        value: function(operation) {
            var objectDescriptor = operation.target,
            mapping = this.mappingForType(objectDescriptor),
            data = operation.data,
            rawDataPrimaryKeys = mapping.rawDataPrimaryKeys,
            originIdKey = rawDataPrimaryKeys[0],
            originIdValue = data[originIdKey];

            return originIdValue.toString();
        }
    },

    invokeMethodProcessingOperation: {
        value: function(operation, promiseIndexesSet, operationCount, commitTransactionOperation) {
            iOperationListenerMethodName = this.methodNameForProcessingOperation(operation);

            if(typeof this[iOperationListenerMethodName] !== "function") {
                console.error("Implementation for "+iOperationListenerMethodName+" is missing");
                return Promise.reject( new Error("Implementation for "+iOperationListenerMethodName+" is missing"));
            }
            else {
                /*
                var self = this;
                return new Promise(function(resolve, reject) {

                    var successfulCompletionOperationType = operation.type+"CompletedOperation",
                        failedCompletionOperationType = operation.type+"FailedOperation";

                    function completedOperationListener(completedOperation) {
                        if(completedOperation.referrerId === operation.id) {
                            var operationReferrerId = operation.referrerId,
                                // objectDescriptor = operation.target,
                                // mapping = self.mappingForType(objectDescriptor),
                                data = operation.data,
                                // rawDataPrimaryKeys = mapping.rawDataPrimaryKeys,
                                // originIdKey = rawDataPrimaryKeys[0],
                                // originIdValue = data[originIdKey],
                                originIdValue = self.originIdValueForOperation(operation);

                                //Find the matching createTransaction operation:
                                createTransactionOperation = self._pendingCreateTransactionOperationById.get(operationReferrerId),
                                phrontObject = createTransactionOperation.dataObjectsByOriginId.get(originId);

                                createTransactionOperation.processedBatchOperations.add(operation);
                                operation.target.removeEventListener(successfulCompletionOperationType, completedOperationListener, false);
                                operation.target.removeEventListener(failedCompletionOperationType, completedOperationListener, false);

                            if(phrontObject) {
                                resolve(phrontObject);
                            } else {
                                reject(new Error("Processing operation failed to create phront object:",operation));
                            }
                        }

                    }
                
                    createOperation.target.addEventListener(successfulCompletionOperationType, completedOperationListener, false);
                    createOperation.target.addEventListener(failedCompletionOperationType, completedOperationListener, false);
    
                    self[iOperationListenerMethodName](operation);
                });
                */
               var result = this[iOperationListenerMethodName](operation);
               //console.log("this["+iOperationListenerMethodName+"](operation)",operation," ---> returned ",result);
               return result.then((value) => {
                    if(promiseIndexesSet) {
                        promiseIndexesSet.delete(operation.index);
                    }
                    // console.log("promiseIndexesSet "+JSON.stringify(Array.from(promiseIndexesSet)));

                    if(operationCount) {
                        self._dispatchCommitTransactionProgress(operation.index,operationCount, commitTransactionOperation);
                    }

                    return value;
               });
            }

        }
    },

    _invokePromiseForOperation: {
        value: function(iOperation, iPreviousPromise, promiseIndexesSet, operationCount, commitTransactionOperation) {
            if(iPreviousPromise) {
                return iPreviousPromise.then(() => {
                    return this.invokeMethodProcessingOperation(iOperation, promiseIndexesSet, operationCount, commitTransactionOperation);
                });
            } else {
                return this.invokeMethodProcessingOperation(iOperation, promiseIndexesSet, operationCount, commitTransactionOperation);
            }
        }
    },

    _dispatchCommitTransactionProgress: {
        value: function(operationIndex, operationCount, commitTransactionOperation) {
            var percentCompletion,
                lastProgressSent = commitTransactionOperation.lastProgressSent || 0,
                progressOperation;
                
            //Make it 40% of the overall process for now:
            percentCompletion = (Math.round((((operationIndex + 1) / operationCount)*0.4)*100) / 100);

            if(percentCompletion > lastProgressSent) {
                progressOperation = new DataOperation();
                progressOperation.referrerId = commitTransactionOperation.id;
                progressOperation.clientId = commitTransactionOperation.clientId;
                //progressOperation.target = transactionObjectDescriptors;
                progressOperation.target = this;
                // progressOperation.type = DataOperation.Type.CommitTransactionProgressOperation;
                progressOperation.type = (commitTransactionOperation.type ===  DataOperation.Type.CommitTransactionOperation) 
                ? DataOperation.Type.CommitTransactionProgressOperation
                : DataOperation.Type.PerformTransactionProgressOperation;

                commitTransactionOperation.lastProgressSent = percentCompletion;
                progressOperation.data = percentCompletion;
                progressOperation.target.dispatchEvent(progressOperation);    
            }

        }
    },

    createRolesIfNeeded: {
        value: function() {
            if(!this.eventOrganizerRole) {
                return this._createObjectDescriptorStoreForTypeIfNeeded(Role)
                .then((wasCreated) => {
                    console.log("_processCreateTransaction(): get RolePromise (Role wasCreated: ",wasCreated+")");
                    
                    //Fetch Shared/reference roles
                    return Promise.all([this.eventOrganizerRolePromise, this.eventAttendeeRolePromise, this.patientRolePromise, this.financialResponsibilityRolePromise, this.customerPreferenceRolePromise, this.emergencyContactRolePromise]);
                });
            } else {
                return Promise.resolve(true);
            }
        }
    },

    _processCreateTransaction: {
        value: function(createTransactionOperation, commitTransactionOperation) {
            var transactionOperations = createTransactionOperation.batchOperations,
                i, countI, iOperation, iOperationListenerMethodName, iPromise, iPreviousPromise,
                operationPromises, PromiseForAll,
                promiseIndexesSet = new Set();
                self = this;

            //Make sure we have check-in questionnaire created:
            //return this.checkInQuestionnaire()
            //.then(() => {
                // return this.createRolesIfNeeded()
            //})
            // .then((roles) => {
                //console.log("_processCreateTransaction(): Roles checked: loop on transactions ("+transactionOperations.length+")");
                // var _resolve;

                // this.performQueuedPendingFetchDataPromise = new Promise(function(resolve, reject) {
                //     _resolve = resolve;
                // });

                for(i=0, countI = transactionOperations.length;(i<countI); i++) {

                    iOperation = transactionOperations[i];

                    iOperation.index = i;
                    promiseIndexesSet.add(i);
    
                    // if(iPreviousPromise) {
                    //     iPromise = iPreviousPromise.then(() => {
                    //         return this.invokeMethodProcessingOperation(iOperation);;
                    //     });
                    // } else {
                    //     iPromise = this.invokeMethodProcessingOperation(iOperation);
                    // }
    
                    iPromise = this._invokePromiseForOperation(iOperation, iPreviousPromise, promiseIndexesSet, countI, commitTransactionOperation);
                    //console.log("_processCreateTransaction(): iPromise:",iPromise,iOperation);

                    if(iPromise) {
                        (operationPromises || (operationPromises = [])).push(iPromise);
    
                        //When promise resolves, we register the objct so it can be found by others
                        iPromise.then(function(resolvedPhrontObject) {
                            if(resolvedPhrontObject) {
                                if(!Array.isArray(resolvedPhrontObject)) {
                                    if(!resolvedPhrontObject.originId) {
                                        throw "Phront object <"+ resolvedPhrontObject.objectDescriptor.name+"> is missing originId";
                                    }
                                    //createTransactionOperation.dataObjectsByOriginId.set(resolvedPhrontObject.originId,resolvedPhrontObject);    
                                    //console.log("_processCreateTransaction(): registerCreateTransactionDataObject:",createTransactionOperation,resolvedPhrontObject);
                                    self.registerCreateTransactionDataObject(createTransactionOperation, resolvedPhrontObject);
    
                                } else {
                                    throw "Implement support for resolved array of Phront Objects";
                                }
                            }
        
                        })
                        .catch((error) => {
                            return Promise.reject(error);
                        });
                    } else {
                        throw "No promise returned";
                    }
                    
                    iPreviousPromise = iPromise;
                }


                /*
                    We should have collected all phront objects to get, so trigger the fetches now, which will resolve promises holding things down.

                    resolve here will trigger the work in this.performQueuedPendingFetchData;

                */

                // // if(countI === 1)
                //     _resolve(true);
                // this.performQueuedPendingFetchDataPromise.then(() => {
                //     this.performQueuedPendingFetchDataPromise = Promise.resolve();
                // })

    
                //console.log("_processCreateTransaction(): loop on transactions done.");

                if(operationPromises && operationPromises.length > 0) {
                    if(operationPromises.length === 1) {
                        PromiseForAll = operationPromises[0];
                    } else {
                        PromiseForAll = Promise.all(operationPromises);
                    }
                }
    
                if(PromiseForAll) {
                    //console.log("_processCreateTransaction(): return PromiseForAll");
                    return PromiseForAll;
                    // return PromiseForAll.then(function(resolvedPromises) {
                    //     console.log("here");
                    // });

                    // return PromiseForAll.then(function(resolvedPromises) {
                    //     return self.rootService.saveChanges();
                    // });
                } else {
                    return Promise.resolve(true);
                }
            
            // })
            // .catch((error) => {
            //     return error;
            // });


        }
    },

    _phrontDataObjectWithDescriptorAndOriginIdInTransactionCache: {
        value: new WeakMap()
    },

    _phrontDataObjectWithDescriptorPendingFetchInfo: {
        value: new Map()
    },

    performQueuedPendingFetchDataForObjectDescriptorWithFetchInfo: {
        value: function(iObjectDescriptor, iPendingFetchInfo) {
            var iCriteria = iPendingFetchInfo.criteria,
                iCriteriaArray = Array.from(iCriteria),
                iCombinedCriteria,
                iQuery;

                iCombinedCriteria = iCriteria.size > 1 ? Criteria.or(iCriteriaArray) : iCriteriaArray[0];

            iQuery = DataQuery.withTypeAndCriteria(iObjectDescriptor, iCombinedCriteria);
            if(iPendingFetchInfo.readExpressions) {
                iQuery.readExpressions = Array.from(iPendingFetchInfo.readExpressions);
            }

            this.rootService.fetchData(iQuery)
            .then(function(combinedFetchedValues) {
                /*
                    value contains all the instances matching any of the combined criteria. Each criteria is expressed in term of raw data, so we need to evaluate it on the snapshots of these objects.

                    So we're going to loop on the objects, and for each object's snapshot, we're going to evaluate it on each criteria.
                */

                //console.log("_combineFetchDataMicrotaskFunctionForTypeQueryParts results:",combinedFetchedValues, " query:",query);

                var i, countI, iCriteria, criteria = iCriteriaArray, combinedFetchedValuesSnapshots, 
                    iFetchPromiseResolvers,
                    j, countJ = combinedFetchedValues.length, jValue, jSnapshot;

                for(i=0, countI = criteria.length; (i<countI); i++) {
                    iCriteria = criteria[i];

                    /*
                        We lazily get the iFetchPromise if a criteria finds a match
                    */
                        iFetchPromiseResolvers = null;

                    for(j=0; (j < countJ); j++) {
                        jSnapshot = combinedFetchedValuesSnapshots && combinedFetchedValuesSnapshots[j];
                        if(!jSnapshot) {
                            jValue = combinedFetchedValues[j];
                            jSnapshot = jValue.snapshot;
                            (combinedFetchedValuesSnapshots || (combinedFetchedValuesSnapshots = []))[j] = jSnapshot;
                        }

                        iFetchPromiseResolvers = (iFetchPromiseResolvers || (iFetchPromiseResolvers = iPendingFetchInfo.promisesByCriteria.get(iCriteria)));

                        if(iCriteria.evaluate(jSnapshot)) {
                            (iFetchPromiseResolvers.result || (iFetchPromiseResolvers.result = [])).push(jValue);

                        }
                    }

                    if(countJ == 0) {
                        iFetchPromiseResolvers = iPendingFetchInfo.promisesByCriteria.get(iCriteria);
                        iFetchPromiseResolvers.resolve(combinedFetchedValues);

                    } else if(iFetchPromiseResolvers) {
                        if(iFetchPromiseResolvers.result) {
                            iFetchPromiseResolvers.result.objectDescriptor = combinedFetchedValues.objectDescriptor;
                            iFetchPromiseResolvers.resolve(iFetchPromiseResolvers.result);
                        } else {
                            iFetchPromiseResolvers.resolve(null);
                        }
                    }
                }
            });
        }
    },

    _performQueuedPendingFetchDataPromise: {
        value: Promise.resolve()
    },
    performQueuedPendingFetchDataPromise: {
        get:  function() {
            return this._performQueuedPendingFetchDataPromise;
        },
        set: function(value) {
            if(value !== this._performQueuedPendingFetchDataPromise) {
                // this._performQueuedPendingFetchDataPromise = this._performQueuedPendingFetchDataPromise.then(() => {
                //     return value;
                // });
                this._performQueuedPendingFetchDataPromise = value;
            }
        }
    },

    performQueuedPendingFetchData: {
        value: function() {
            //console.debug(this._phrontDataObjectWithDescriptorPendingFetchInfo);

            // this.performQueuedPendingFetchDataPromise.then(() => {
                var pendingFetchInfoByObjectDescriptor =  this._phrontDataObjectWithDescriptorPendingFetchInfo,
                    keysIterator = pendingFetchInfoByObjectDescriptor.keys(),
                    iteration,
                    pendingFetchInfoByObjectDescriptor;

                while(!(iteration = keysIterator.next()).done) {
                    this.performQueuedPendingFetchDataForObjectDescriptorWithFetchInfo(iteration.value, pendingFetchInfoByObjectDescriptor.get(iteration.value));
                }
                this._phrontDataObjectWithDescriptorPendingFetchInfo.clear();
                //this.performQueuedPendingFetchDataPromise = Promise.resolve();
            // });

        }
    },

    phrontDataObjectWithDescriptorAndOriginIdInTransaction: {
        value: function(objectDescriptor, originId, createTransactionOperation, rawDataObjectDescriptor, readExpressions, criteria) {
// console.warn("phrontDataObjectWithDescriptorAndOriginIdInTransaction("+objectDescriptor.name+","+originId);
            /*
                If we don't catch it up here, and in a previous transactions roles for staff_type or account_relationship_type were created, we'll fetch, find nothing, and then end-up re-creating all types.

                We could make the code that creates the types the first time check again fetching to see if that's necessary, but we might as well nip it in the budd here by adding a specific test for a originId value of 0 or "0".
            */

            if(!originId || originId === "" || originId === "0" || originId === 0) {
                //Can't find anything without an originId to start with
                return Promise.resolve(null);
            }

            var self = this,
                cache = this._phrontDataObjectWithDescriptorAndOriginIdInTransactionCache,
                transactionCache,
                objectDescriptorCache,
                instanceCache,
                cachedValue,
                cachedPromise,
                originIdCriteria = new Criteria().initWithExpression("originId == $.id", {
                    id: originId.toString()
                });

            originId = originId.toString();

            if(criteria) {
                criteria = criteria.and(originIdCriteria);
            } else {
                criteria = originIdCriteria;
            }

            //This cche is only for phront objects that have uuid id that won't conflict
            if(objectDescriptor) {
                cachedValue = this.registeredDataObjectForTypeOriginIdInCreateTransaction(objectDescriptor, originId, createTransactionOperation);
                if(cachedValue) {

                    if(readExpressions) {
                        cachedPromise = self.rootService.getObjectProperties(cachedValue,readExpressions)
                        .then((value) => {
                            return cachedValue;
                        });
                    } else {
                        cachedPromise = Promise.resolve(cachedValue);
                    }
                }
                // cachedPromise = Promise.resolve(createTransactionOperation.dataObjectsByOriginId.get(originId));
            } 
            
            if(!cachedPromise) {

                if(objectDescriptor) {
                    transactionCache = cache.get(createTransactionOperation);
                    if(!transactionCache) {
                        transactionCache = new WeakMap();
                        cache.set(createTransactionOperation, transactionCache);
                    }
        
                    objectDescriptorCache = transactionCache.get(objectDescriptor);
                    if(!objectDescriptorCache) {
                        objectDescriptorCache = new WeakMap();
                        transactionCache.set(objectDescriptor, objectDescriptorCache);
                    }
        
                    instanceCache = objectDescriptorCache.get(objectDescriptor);
                    if(!instanceCache) {
                        instanceCache = new Map();
                        objectDescriptorCache.set(objectDescriptor, instanceCache);
                    }
        
                    cachedPromise = instanceCache.get(originId);    
                }
    
                if(!cachedPromise) {

                    if(objectDescriptor) {
                        /*
                            We may have to loop on un-processed merge operations and use criteria beyond primary/foreign keys to find the right merge operation and process it as it's asked for
                        */
        
                        /* First, make sure the table exists: */
                        cachedPromise = this._createObjectDescriptorStoreForTypeIfNeeded(objectDescriptor)
                        .then(function(wasCreated) {
                            /*
                                Second, fetch the row to see if it exists:
                            */
                            
                            var objectQuery = DataQuery.withTypeAndCriteria(objectDescriptor, criteria),
                                mapping = self.rootService.mappingForType(objectDescriptor);

                            //Make sure we fetch originId as we need it.
                            if(readExpressions) {
                                if(readExpressions.indexOf("originId") === -1) {
                                    readExpressions.push("originId");
                                }
                            } else {
                                readExpressions = Array.from(mapping.requisitePropertyNames).concat(["originId"]);
                                //readExpressions = ["originId"];
                            }
                            objectQuery.readExpressions = readExpressions;
                            //objectQuery.readExpressions = ["originId"];

                            /*
                            var pendingFetchInfo = self._phrontDataObjectWithDescriptorPendingFetchInfo.get(objectDescriptor);
                            if(!pendingFetchInfo) {
                                self._phrontDataObjectWithDescriptorPendingFetchInfo.set(objectDescriptor, (pendingFetchInfo = {
                                    readExpressions: Set.from(readExpressions),
                                    criteria: Set.from([criteria]),
                                    promisesByCriteria: new Map()
                                }));

                                //Too much async cascading for that to work here.
                                //queueMicrotask(function() {
                                //    self.performQueuedPendingFetchData();
                                //});
                                self.performQueuedPendingFetchDataPromise.then(() => {
                                    self.performQueuedPendingFetchData();
                                });
    

                            } else {
                                pendingFetchInfo.readExpressions.addEach(readExpressions);
                                if(!pendingFetchInfo.criteria.hasEqual(criteria)) {
                                    pendingFetchInfo.criteria.add(criteria);
                                }
                            }

                            //This promise will be resolved when we eveluate individual criteria on the combined results
                            var resultPromise = new Promise(function(resolve, reject) {
                                pendingFetchInfo.promisesByCriteria.set(criteria, {
                                    resolve: resolve,
                                    reject: reject
                                });

                            });

                            return resultPromise;
                            */
                            return self.rootService.fetchData(objectQuery);
                        })
                        .then(function(result) {
                            if(result && result.length === 1) {
                                //console.log("Fetched "+objectDescriptor.name+" with  originId:"+originId);
                                //createTransactionOperation.dataObjectsByOriginId.set(originId, result[0]);
                                self.registerCreateTransactionDataObject(createTransactionOperation, result[0]);

                                /*
                                    PhrontService isn't capable yet of creating itself the read data operation to get read expressions that need fetches on other tables, so we have to add a step there.

                                    When it does, we should just have to remove that and include all readExpressions + originId in the original request as earlier.
                                */
                                if(readExpressions) {
                                    //console.log(objectDescriptor.name+": getObjectProperties("+JSON.stringify(readExpressions)+")");
                                    return self.rootService.getObjectProperties(result[0],readExpressions)
                                    .then((value) => {
                                        return result[0]; 
                                    });
                                } else {
                                    return result[0]; 
                                }

                            } else if(result.length > 1) {
                                throw "More than one "+objectDescriptor.name+" with originId: '"+originId+"'";
                                // console.log("Fetched "+objectDescriptor.name+" with originId:"+originId+" - return null");
                            }
                        })
                        .catch(function(caughtError) {
                            console.error("Error fetching objectQuery:",caughtError);
                            return null;
                        });
                    }

                    if(!cachedPromise) {
                        cachedPromise = Promise.resolve(null);
                    }

                    cachedPromise = cachedPromise.then(function(result) {
                        if(result) {
                            return result;
                        }
                        else if(rawDataObjectDescriptor) {

                            //Check the rawOperations cache for when we don't have a matching phront type: if there's ann entry, we processed (synchronously) local create operations from file.
                            if(!objectDescriptor && createTransactionOperation.operationsByOriginId.get(rawDataObjectDescriptor)) {
                                return Promise.resolveNull;
                            }
    
                            //Check if we have raw data in the form of merge operations:
                            var transactionFolderModuleId = "../raw-data/"+rawDataObjectDescriptor.name,
                                fullPath = PATH.join(__dirname, transactionFolderModuleId),
                                transactionData;
    
                            if(fs.lstatSync(fullPath).isDirectory() ) {
                                operationModuleIds = fs.readdirSync(fullPath).map(fileName => {
                                    return PATH.join(transactionFolderModuleId, fileName);
                                });
                            }
    
                            if(operationModuleIds && operationModuleIds.length) {
                                for(var i=0, countI = operationModuleIds.length, iCreateOperation, iOriginIdValue, promises, iPromise, finalPromise; (i<countI); i++) {
                                    iOperationData = fs.readFileSync(PATH.join(__dirname, operationModuleIds[i]), 'utf8');
    
                                    self._deserializer.init(iOperationData, require, undefined, undefined, true/*isSync*/);
                                    try {
                                        iCreateOperation = self._deserializer.deserializeObject();
                                    } catch (ex) {
                                        console.error("No deserialization for ",operationModuleIds[i]);
                                    }
    
                                    iPromise = self._processLocalCreateOperation(iCreateOperation, createTransactionOperation);
                                    iOriginIdValue = self.originIdValueForOperation(iCreateOperation);

                                    if(instanceCache) {
                                        instanceCache.set(iOriginIdValue,iPromise);
                                    }

                                    if(iOriginIdValue === originId) {
                                        finalPromise = iPromise;
                                    }

                                    (promises || (promises = [])).push(iPromise);
                                }
    
                                if(promises) {
                                    // if(promises.length === 0) {
                                    //     finalPromise = promises[0];
                                    // } else {
                                    //     finalPromise = Promise.all(promises);
                                    // }
    
                                    return Promise.all(promises).then(() => {
                                        return finalPromise;
                                        // return  createTransactionOperation.dataObjectsByOriginId.get(originId);
                                    });
    
                                } else {
                                    return Promise.resolveNull;
                                }
    
                            } else {
                                return Promise.resolveNull;
                            }
                        } else {
                            return Promise.resolveNull;
                        }
                    });
    
                    if(instanceCache) {
                        instanceCache.set(originId,cachedPromise);
                    }
                }
            }
            return cachedPromise;
        }    
    },

    
    _processLocalCreateOperation: {
        value: function(createOperation, createTransactionOperation) {
            var self = this,
                iOperationListenerMethodName = self.methodNameForProcessingOperation(createOperation),
                originIdValue = this.originIdValueForOperation(createOperation),
                rawDataObjectsByTypeByOriginId = createTransactionOperation.rawDataObjectsByTypeByOriginId,
                rawDataObjectsByType;


            /*
                One structure holds just the data, the other the whole operation
                they grew to overlap each other which should be streamlined.
            */

            rawDataObjectsByType = rawDataObjectsByTypeByOriginId.get(createOperation.target);
            if(!rawDataObjectsByType) {
                rawDataObjectsByTypeByOriginId.set(createOperation.target,(rawDataObjectsByType = new Map()));
            }
            rawDataObjectsByType.set(originIdValue,createOperation.data);

            this.setOperationForTypeOriginIdInCreateTransactionOperation(createOperation, createOperation.target, originIdValue, createTransactionOperation);


            createOperation.referrerId = createTransactionOperation.id;
            // return new Promise(function(resolve, reject) {
            //     var successfulCompletionOperationType = createOperation.type+"CompletedOperation",
            //         failedCompletionOperationType = createOperation.type+"FailedOperation";

            //     function completedOperationListener(completedOperation) {
            //         if(completedOperation.referrerId === createOperation.id) {
            //             var operationReferrerId = createOperation.referrerId,
            //                 // objectDescriptor = operation.target,
            //                 // mapping = self.mappingForType(objectDescriptor),
            //                 data = createOperation.data,
            //                 // rawDataPrimaryKeys = mapping.rawDataPrimaryKeys,
            //                 // originIdKey = rawDataPrimaryKeys[0],
            //                 // originIdValue = data[originIdKey],
            //                 originIdValue = self.originIdValueForOperation(createOperation);

            //                 //Find the matching createTransaction operation:
            //                 createTransactionOperation = self._pendingCreateTransactionOperationById.get(operationReferrerId),
            //                 phrontObject = createTransactionOperation.dataObjectsByOriginId.get(originId);

            //                 // createTransactionOperation.processedBatchOperations.add(createOperation);
            //                 createOperation.target.removeEventListener(successfulCompletionOperationType, completedOperationListener, false);
            //                 createOperation.target.removeEventListener(failedCompletionOperationType, completedOperationListener, false);

            //             if(phrontObject) {
            //                 resolve(phrontObject);
            //             } else {
            //                 reject(new Error("Processing operation failed to create phront object:",operation));
            //             }
            //         }

            //     }
            
            //     createOperation.target.addEventListener(successfulCompletionOperationType, completedOperationListener, false);
            //     createOperation.target.addEventListener(failedCompletionOperationType, completedOperationListener, false);

            //     //Set the current transaction as the referrer, so the rest can work
            //     //#WARNING Watch for side effects while debugging
            //     createOperation.referrerId = createTransactionOperation.id;

            //     self[iOperationListenerMethodName](createOperation);

            // });

            if(typeof self[iOperationListenerMethodName] === "function") {
                return self[iOperationListenerMethodName](createOperation);
            } else {
                //console.debug("no method named "+iOperationListenerMethodName);
                return Promise.resolveNull;
            }


        }
    },
    performAccountRelationshipTypesCreateOperation: {
        value: function(createOperation) {
            var role = this.rootService.createDataObject(Role),
            originIdValue = this.originIdValueForOperation(createOperation),
            createTransactionOperation = this._pendingCreateTransactionOperationById.get(createOperation.referrerId);

            //Set the locales property on the role so we know we should expect an object structure.
            //It might be worth setting the type of this object to be something like a new LoalizationDictionary
            //rather than just an anonymous object
            role.locales = [englishLocale];

            role.originId = originIdValue.toString();
        
            role.name = {
                "en": {
                    "*": createOperation.data.permanent_label
                }
            };
            
            /*
                Register it in the createTransaction so we can find it when we have references to it later within the same transaction.
            */
           //createTransactionOperation.dataObjectsByOriginId.set(role.originId, role);
           this.registerCreateTransactionDataObject(createTransactionOperation, role);

           return Promise.resolve(role);
        }
    },

    performAccountRelationshipTypesMergeOperation: {
        value: function(mergeOperation) {
            console.log("performAccountRelationshipTypesMerge(): ",mergeOperation);

            var mainService = this.rootService,
                referrerId = mergeOperation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                // objectDescriptor = mergeOperation.target,
                // mapping = this.mappingForType(objectDescriptor),
                data = mergeOperation.data,
                // rawDataPrimaryKeys = mapping.rawDataPrimaryKeys,
                // originIdKey = rawDataPrimaryKeys[0],
                // originIdValue = data[originIdKey],
                originIdValue = this.originIdValueForOperation(mergeOperation),
                phrontObjectDescriptor = mainService.objectDescriptorForType(Role),
                self = this;
            /*
                First, make sure the table exists:
            */
            return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontObjectDescriptor, originIdValue, createTransactionOperation)
            .then(function(role) {
                if(!role) {
                    //Object doesn't exist, so we create it
                    role = mainService.createDataObject(Role);

                    //Set the locales property on the role so we know we should expect an object structure.
                    //It might be worth setting the type of this object to be something like a new LoalizationDictionary
                    //rather than just an anonymous object
                    role.locales = [englishLocale];

                    role.originId = originIdValue;
                
                    role.name = {
                        "en": {
                            "*":data.permanent_label
                        }
                    };
                    
                    /*
                        Register it in the createTransaction so we can find it when we have references to it later within the same transaction.
                    */
                   //createTransactionOperation.dataObjectsByOriginId.set(role.originId, role);
                   self.registerCreateTransactionDataObject(createTransactionOperation, role);


                }

                return role;

            });

        }
    },

    /*---------------------------------------------------------------------------------------------------------------------*/

    performStaffTypesCreateOperation: {
        value: function(createOperation) {

            console.log("performStaffTypesCreate(): ",createOperation);

            /*
                Types from the origin live in their own table and have integer primary keys typically in the 100's. SO to avoid conflicts when we use them as originId, we're going to add STAFF_TYPE_ORIGIN_ID_RANGE_START to the id of staff_type.
            */

           createOperation.data.type_id = (STAFF_TYPE_ORIGIN_ID_RANGE_START+createOperation.data.type_id);

            var mainService = this.rootService,

                referrerId = createOperation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                // rawObjectDescriptor = createOperation.target,
                // rawMapping = this.mappingForType(rawObjectDescriptor),
                // rawDataPrimaryKeys = rawMapping.rawDataPrimaryKeys,
                data = createOperation.data,
                // originIdKey = rawDataPrimaryKeys[0],
                // originIdValue = data[originIdKey],
                originIdValue = this.originIdValueForOperation(createOperation),

                objectDescriptor = mainService.objectDescriptorForType(Role),
                createPromise = this.createStaffTypes(data, originIdValue, createTransactionOperation);

            this.setOperationForTypeOriginIdInCreateTransactionOperation(createOperation, createOperation.target, originIdValue, createTransactionOperation);
            // createPromise.then(function(role) {
            //     var operation = new DataOperation();
            //     operation.referrerId = createOperation.id;
            //     //We keep the same
            //     operation.target = createOperation.target;
            //     operation.type = DataOperation.Type.CreateCompletedOperation;
            //     operation.target.dispatchEvent(operation);
            // });
            return createPromise;
        }
    },

    createStaffTypes: {
        value: function(rawData, originIdValue, createTransactionOperation) {
            //console.log("createStaffTypes",rawData);
            var mainService = this.rootService,
                role =  mainService.createDataObject(Role);

                role.locales = [englishLocale];

                role.originId = originIdValue.toString();
            
                role.name = {
                    "en": {
                        "*":rawData.permanent_label
                    }
                };

            /*
                Register it in the createTransaction so we can find it when we have references to it later within the same transaction.
            */

            //createTransactionOperation.dataObjectsByOriginId.set(role.originId, role);
            this.registerCreateTransactionDataObject(createTransactionOperation, role);
        

            return Promise.resolve(role);
        }
    },

    /*---------------------------------------------------------------------------------------------------------------------*/

    performCountryTypesCreateOperation: {
        value: function(operation) {
            //console.log("performCountryTypesCreate("+operation.data.permanent_label+"): ",operation);

            return this._createObjectDescriptorStoreForTypeIfNeeded(Country)
            .then((wasCreated) => {
                var mainService = this.rootService,
                referrerId = operation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                // rawObjectDescriptor = operation.target,
                // rawMapping = this.mappingForType(rawObjectDescriptor),
                // rawDataPrimaryKeys = rawMapping.rawDataPrimaryKeys,
                data = operation.data,
                // originIdKey = rawDataPrimaryKeys[0],
                // originIdValue = data[originIdKey],
                originIdValue = this.originIdValueForOperation(operation),

                objectDescriptor = mainService.objectDescriptorForType(Country),
                self = this,
                country =  mainService.createDataObject(Country);

                country.locales = [englishLocale];
                country.iso3166_1_alpha2Ccode = data.iso_country_code;
                country.name = data.permanent_label;
                country.phoneCode = data.phone_country_code;
                country.originId = data.type_id.toString();
    
                return Promise.resolve(country);
            });
        }
    },

    performGenderTypesCreateOperation: {
        value: function(operation) {
            //console.log("performGenderTypesCreate(): ",operation);

            return this._createObjectDescriptorStoreForTypeIfNeeded(Gender)
            .then((wasCreated) => {
                var mainService = this.rootService,
                referrerId = operation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                data = operation.data,
                originIdValue = this.originIdValueForOperation(operation),

                objectDescriptor = mainService.objectDescriptorForType(Gender),
                gender =  mainService.createDataObject(Gender);

                gender.locales = [englishLocale];
                gender.name = data.permanent_label;
                gender.originId = data.type_id.toString();
    
                return Promise.resolve(gender);
            });

        }
    },

    performPhoneLabelTypesCreateOperation: {
        value: function(operation) {
            //console.debug("performPhoneLabelTypesCreate(): nothing special to do for now",operation);
            return Promise.resolve(true);
        }
    },

    performAppointmentStatusTypesMergeOperation: {
        value: function(mergeOperation) {
            //console.log("handleAppointmentStatusTypesMerge(): ",mergeOperation);
            return Promise.resolve(true);
        }
    },

    // handleOperationPromise: {
    //     value: function(operation, promise) {
    //         var referrerId = operation.referrerId,
    //         //Find the matching createTransaction operation:
    //         createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId);

    //         /*
    //             If it's part of a transaction, we'll gather them in a Promise.all() when we handleCommitTransaction, so we need to collect them
    //         */
            
    //         if(createTransactionOperation) {
    //             var promises = this._operationPromisesByCreateTransactionOperationId.get(createTransactionOperation.id);

    //             if(!promises) {
    //                 this._operationPromisesByCreateTransactionOperationId.set(createTransactionOperation.id, (promises = []));
    //             } else if(promises.length) {
    //                 //We make a promise depend on the one before it:
    //                 promise = promises[promises.length-1].then(function() {
    //                     return promise;
    //                 });

    //             }
    //             promises.push(promise);

    //             //When promise resolves, we register the objct so it can be found by others
    //             promise.then(function(resolvedPhrontObject) {
    //                 if(!resolvedPhrontObject.originId) {
    //                     throw "Phront object <"+ resolvedPhrontObject.objectDescriptor.name+"> is missing originId";
    //                 }
    //                 createTransactionOperation.dataObjectsByOriginId.set(resolvedPhrontObject.originId,resolvedPhrontObject);
    //             });


    //             var transactionUpdatedOperation = new DataOperation();
    //             transactionUpdatedOperation.referrerId = operation.id;
    //             //We keep the same
    //             transactionUpdatedOperation.target = operation.target;
    //             transactionUpdatedOperation.type = DataOperation.Type.TransactionUpdatedOperation;
    //             transactionUpdatedOperation.data = {
    //                 transactionId: referrerId
    //             };
    //             transactionUpdatedOperation.target.dispatchEvent(transactionUpdatedOperation);
    //         } else {
    //             console.warn("logic branch not implemented");
    //         }

    //     }
    // },

    commitTransactionPromiseForOperation: {
        value: function(operation) {
            var referrerId = operation.referrerId,
            //Find the matching createTransaction operation:
            createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId);

            if(createTransactionOperation) {
                return this._createTransactionOperationPromiseById.get(referrerId);
            } else {
                return Promise.resolve(true);
            }
        }
    },

    performPracticeMergeOperation: {
        value: function(mergeOperation) {
            //console.log("handlePracticeMerge(): ",mergeOperation);
            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(Organization),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyEmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(EmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPostalAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PostalAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartySMSNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyContactForm),
                this._createObjectDescriptorStoreForTypeIfNeeded(ContactForm),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyInstantMessageAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(InstantMessageAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(RoleRanking),
                //this.checkInQuestionnaire(),
                this.createRolesIfNeeded()
            ])
            .then((wasCreated) => {
                var mainService = this.rootService,
                referrerId = mergeOperation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                // rawObjectDescriptor = mergeOperation.target,
                // rawMapping = this.mappingForType(rawObjectDescriptor),
                // rawDataPrimaryKeys = rawMapping.rawDataPrimaryKeys,
                data = mergeOperation.data,
                // originIdKey = rawDataPrimaryKeys[0],
                // originIdValue = data[originIdKey],
                originIdValue = this.originIdValueForOperation(mergeOperation),
                objectDescriptor = mainService.objectDescriptorForType(Organization),
                self = this;

                return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(objectDescriptor, originIdValue, createTransactionOperation, null, ["emailAddresses", "postalAddresses","phoneNumbers"])
                .then(function(practice) {
                    if(!practice) {
                        return self.createPractice(data, originIdValue, createTransactionOperation);
                    } else {
                        return self.updatePractice(practice,data);
                    }
                });
            });
        }
    },

    cognitoUserPoolNameForOrganization: {
        value: function(organization) {
            return `${organization.name}@${organization.originId}`;
        }
    },


    createCogentDesignCustomerCognitoUserPoolForOrganization: {
        value: function(organization) {

            var self = this;
            return new Promise(function(resolve, reject) {
                var mainService = self.rootService,
                    objectDescriptor = mainService.objectDescriptorForType(CognitoUserPool),
                createOperation = new DataOperation();

                createOperation.target = objectDescriptor;
                createOperation.type = DataOperation.Type.CreateOperation;
                createOperation.data = {
                    name: self.cognitoUserPoolNameForOrganization(organization)
                };

                function createCompletedHandler(operation) {
                    if(operation.referrerId === createOperation.id) {
                        cleanupdHandlers();

                        /*
                            This is a creative hack, we should be able to create a CognitoUserPool, assign it to a UserPool, saveChanges() and all works out with Cognito object being created before we can perform the create of a UserPool since we need the CognitoUserPool primary key and identifier which are only available after it's been created with the Cognito SDK createUserPool() method.

                            Here we're re-forcing a fetch even though we have all the data, so we use a regular code path that creates the CognitoUserPool object correctly.
                        */

                            var criteria = new Criteria().initWithExpression("Id == $.Id", {
                                Id: operation.data.Id
                            }),
                            userPoolQuery = DataQuery.withTypeAndCriteria(CognitoUserPool, criteria);
                            
                            userPoolQuery.fetchLimit = 1;
            
                            return self.mainService.fetchData(userPoolQuery)
                            .then((result) => {
                                if(result.length === 1) {
                                    resolve(result[0]);
                                } else {
                                    reject(new Error(`No Cognito User Pool found for Id:"${operation.data.Id}"`));
                                }
                            })
                            .catch(function(error) {
                                reject(error);
                            });
                        }
                }

                function createFailedHandler(operation) {
                    if(operation.referrerId === createOperation.id) {
                        cleanupdHandlers();
                        reject(operation.data);
                    }
                }

                function cleanupdHandlers() {
                    self.removeEventListener(DataOperation.Type.CreateCompletedOperation,createCompletedHandler, false);
                    self.removeEventListener(DataOperation.Type.createFailedHandler,createCompletedHandler, false);
                }

                objectDescriptor.addEventListener(DataOperation.Type.CreateCompletedOperation, createCompletedHandler, false);
                objectDescriptor.addEventListener(DataOperation.Type.CreateFailedOperation, createFailedHandler, false);

                objectDescriptor.dispatchEvent(createOperation);

            });
        }
    },
    /*
        Returns a promise for an app/user-pool

        Create a default Cognito User Pool if we don't have one. There's a 1000 limit of pools per accounts. So we'll create user pools named:
        cogent-design-customers-1 to cogent-design-customers-1000

        First, check if we already have one:
    */

    createCogentDesignCustomerUserPoolForOrganization: {
        value: function(organization) {
            var self = this,
                mainService = this.rootService,
                userPoolCriteria = new Criteria().initWithExpression("name == $.name", {
                    name: self.cognitoUserPoolNameForOrganization(organization)
                }),
                userPoolQuery = DataQuery.withTypeAndCriteria(CognitoUserPool, userPoolCriteria);
        
            return mainService.fetchData(userPoolQuery)
            .then((result) => {
                if(result && result.length === 1) {
                    return result[0];
                } else {
                    return this.createCogentDesignCustomerCognitoUserPoolForOrganization(organization)
                }
            })
            .then(function(aCognitoUserPool) {
                var mainService = self.rootService,
                    practiceUserPool = mainService.createDataObject(UserPool);
                /*
                    Should probably be automated by some business logic
                */
                    practiceUserPool.name = aCognitoUserPool.name;

                    practiceUserPool.cognitoUserPool = aCognitoUserPool;
                    organization.userPools = [practiceUserPool];

                return practiceUserPool;
            });
        }
    },


    createCogentDesignCustomerCognitoUserPoolClientWithName: {
        value: function (cognitoUserPool, userPoolClientName) {
            var self = this,
                mainService = this.rootService,
                userPoolClientCriteria = new Criteria().initWithExpression("userPoolId == $.userPoolId && clientName == $.userPoolClientName", {
                    userPoolId: cognitoUserPool.id,
                    userPoolClientName: userPoolClientName
                }),
                userPoolQuery = DataQuery.withTypeAndCriteria(CognitoUserPoolClient, userPoolClientCriteria);

            return mainService.fetchData(userPoolQuery)
                .then((result) => {
                    if (result && result.length === 1) {
                        return mainService.getObjectProperties(result[0], "clientSecret")
                        .then(function() {
                            return result[0];
                        });
                    } else {

                        return new Promise(function (resolve, reject) {
                            var mainService = self.rootService,
                                objectDescriptor = mainService.objectDescriptorForType(CognitoUserPoolClient),
                                createOperation = new DataOperation();

                            createOperation.target = objectDescriptor;
                            createOperation.type = DataOperation.Type.CreateOperation;
                            createOperation.data = {
                                ClientName: userPoolClientName, /* required */
                                UserPoolId: cognitoUserPool.id, /* required */
                                GenerateSecret: true
                            };

                            function createCompletedHandler(operation) {
                                if (operation.referrerId === createOperation.id) {
                                    cleanupdHandlers();

                                    /*
                                        This is a creative hack, we should be able to create a CognitoUserPool, assign it to a UserPool, saveChanges() and all works out with Cognito object being created before we can perform the create of a UserPool since we need the CognitoUserPool primary key and identifier which are only available after it's been created with the Cognito SDK createUserPool() method.
            
                                        Here we're re-forcing a fetch even though we have all the data, so we use a reular code path that creates the CognitoUserPool object correctly.
                                    */

                                    var criteria = new Criteria().initWithExpression("UserPoolId == $.UserPoolId && ClientId == $.ClientId", {
                                        UserPoolId: operation.data.UserPoolId,
                                        ClientId: operation.data.ClientId
                                    }),
                                        userPoolClientQuery = DataQuery.withTypeAndCriteria(CognitoUserPoolClient, criteria);

                                    userPoolClientQuery.fetchLimit = 1;

                                    return self.mainService.fetchData(userPoolClientQuery)
                                        .then((result) => {
                                            if (result.length === 1) {
                                                resolve(result[0]);
                                            } else {
                                                reject(new Error(`No Cognito User Pool Client found for UserPoolId:"${UserPoolId}", ClientId:"${ClientId}"`));
                                            }
                                        })
                                        .catch(function (error) {
                                            reject(error);
                                        });
                                }
                            }

                            function createFailedHandler(operation) {
                                if (operation.referrerId === createOperation.id) {
                                    cleanupdHandlers();
                                    reject(operation.data);
                                }
                            }

                            function cleanupdHandlers() {
                                self.removeEventListener(DataOperation.Type.CreateCompletedOperation, createCompletedHandler, false);
                                self.removeEventListener(DataOperation.Type.createFailedHandler, createCompletedHandler, false);
                            }

                            objectDescriptor.addEventListener(DataOperation.Type.CreateCompletedOperation, createCompletedHandler, false);
                            objectDescriptor.addEventListener(DataOperation.Type.CreateFailedOperation, createFailedHandler, false);

                            objectDescriptor.dispatchEvent(createOperation);

                        });
                    }
                });
        }
    },
    /*
        Returns a promise for an app/user-pool

        Create a default Cognito User Pool if we don't have one. There's a 1000 limit of pools per accounts. So we'll create user pools named:
        cogent-design-customers-1 to cogent-design-customers-1000

        First, check if we already have one:
    */

    _createApplicationAndUserPoolClients: {
        value: function(organization, userPool, cognitoUserPoolClient) {
            var mainService = self.rootService;

            var application = mainService.createDataObject(Application);
            application.name = cognitoUserPoolClient.clientName;
            application.controllingOrganization = organization;

            var userPoolClient = mainService.createDataObject(UserPoolClient);
            /* Should probably be automated by some business logic */
            userPoolClient.name = application.name;

            userPoolClient.identifier = cognitoUserPoolClient.clientId;
            userPoolClient.credentials = cognitoUserPoolClient.clientSecret;
            userPoolClient.userPool = userPool;
            userPoolClient.cognitoUserPoolClient = cognitoUserPoolClient;
            userPoolClient.application = application;
        }
    },


    createCogentDesignCustomerOrgnizationAppClients: {
        value: function(organization) {
            this.createCogentDesignCustomerOrgnizationAppClientNamed(organization, "plumming-workstation");
            this.createCogentDesignCustomerOrgnizationAppClientNamed(organization, "plumming-tool");
            this.createCogentDesignCustomerOrgnizationAppClientNamed(organization, "plum-appointments");
        }
    },


    createCogentDesignCustomerOrgnizationAppClientNamed: {
        value: function(organization, appClientName) {
            var mainService = this.rootService;

            var application = mainService.createDataObject(Application);
            application.name = appClientName;
            application.controllingOrganization = organization;

            var appClient = mainService.createDataObject(AppClient);
            appClient.name = application.name;

            appClient.identifier = crypto.randomUUID({disableEntropyCache:false});

            // Synchronous
            const buf = crypto.randomBytes(32);
            appClient.credentials =  `${buf.toString('hex')}`;
            appClient.application = application;
        }
    },


    createCogentDesignCustomerOrgnizationUserPoolClientsForUserPool: {
        value: function(organization, userPool) {
            var self = this;

            return Promise.all([
                this.createCogentDesignCustomerCognitoUserPoolClientWithName(userPool.cognitoUserPool, "plumming-workstation"),
                this.createCogentDesignCustomerCognitoUserPoolClientWithName(userPool.cognitoUserPool, "plumming-tool"),
                this.createCogentDesignCustomerCognitoUserPoolClientWithName(userPool.cognitoUserPool, "plum-appointments")
            ])
            .then(function(userPoolClients) {
                self._createApplicationAndUserPoolClients(organization, userPool, userPoolClients[0]);
                self._createApplicationAndUserPoolClients(organization, userPool, userPoolClients[1]);
                self._createApplicationAndUserPoolClients(organization, userPool, userPoolClients[2]);

                return organization;
            })
            .catch(function(error) {
                return Promise.reject(error);
            });
        }
    },


    cogentDesignOrganizationName: {
        value: "Cogent Design, Inc."
    },

    // createCogentDesignOrganization: {
    //     value: function(rawData, originId, createTransactionOperation) {

    //         //console.log("createPractice",rawData);
    //         var mainService = this.rootService,
    //             cogentDesignOrganization =  mainService.createDataObject(Organization);
    //             cogentDesignOrganization.name = this.cogentDesignOrganizationName;

    //         /*
    //             Create the UserPools.

    //             When a UserPool is created, we'll need business logic to handle the creation of CognitoUserPool for it. The CognitoUserPool's id is stored in UserPool's cognitoUserPoolId property, so we need that value to add it to create of UserPool before saving.

    //             The easiest would be to have a captureUserPoolCreateOperation. But right now, these operations are nested in an append operations and processed direcly outside of typical event routing which we need to be able to have the custom logic there to create a cognito object first.
    //         */
    //         var cogentDesignUserPool = mainService.createDataObject(UserPool);
    //         cogentDesignUserPool.name = "cogent-design";
    //         cogentDesignOrganization.userPools = [cogentDesignUserPool];

    //         var provisionPlumming = mainService.createDataObject(Application);
    //         provisionPlumming.name = "provision-plumming";
    //         provisionPlumming.controllingOrganization = cogentDesignOrganization;

    //         var provisionPlummingClient = mainService.createDataObject(UserPoolClient);
    //         provisionPlummingClient.name = "provision-plumming";
    //         provisionPlummingClient.application = provisionPlumming;
    //         provisionPlummingClient.userPool = cogentDesignUserPool;

    //         return Promise.resolve(cogentDesignOrganization);

    //     }
    // },

    _cogentDesignOrganization: {
        value: undefined
    },

    cogentDesignOrganization: {
        value: function() {

            if(!this._cogentDesignOrganization) {
                var criteria = new Criteria().initWithExpression("name == $.name", {
                    name: this.cogentDesignOrganizationName
                }),
                query = DataQuery.withTypeAndCriteria(Organization, criteria);
    
                return this.rootService.fetchData(query)
                .then((result) => {
                    if(result.length === 0 ) {
                        throw "Cogent Design Inc Organization not found";
                    } else {
                        this._cogentDesignOrganization = result[0];
                        return result[0];
                    }
                });    
            } else {
                return Promise.resolve(this._cogentDesignOrganization);
            }
        }
    },

    createPractice: {
        value: function(rawData, originId, createTransactionOperation) {
            var self = this;

            return this.cogentDesignOrganization()
            .then(function(cogentDesignOrganization) {
                //console.log("createPractice",rawData);
                var mainService = self.rootService,
                    organization =  mainService.createDataObject(Organization);
                organization.name = rawData.practice_name;
                organization.originId = rawData.practice_id.toString();
                organization.parent = cogentDesignOrganization;

                return self.createPracticeAuthentication(organization)
                // .then(function() {
                //     return organization;
                // });
            })
            .then(function(dataObject){
                return self.processPracticeCustomerEngagementQuestionnaires(dataObject, rawData);
            })
           .then(function(dataObject){
                return self.processPracticeAppointmentsDefaults(dataObject, rawData);
            });
        }
    },
    updatePractice: {
        value: function(dataObject, rawData) {
            console.log("updatePractice",dataObject,rawData);
            var mainService = this.rootService,
                self = this;

            return mainService.getObjectProperties(dataObject, "parent"/*, "userPools"*/)
            .then(function() {
                if(!dataObject.parent) {
                    return self.cogentDesignOrganization()
                    .then(function(cogentDesignOrganization) {
                        dataObject.parent = cogentDesignOrganization;
                        return dataObject;
                    });
                }
                return dataObject;
            })
            /*
                Taking that out as we shouldn't be updating these aspects on merge, 
                thiis is all done at creation / provision time
            */
            // .then(function(dataObject) {
            //     if(!dataObject.userPools) {
            //         self.updatePracticeAuthenticationIfNeeded(dataObject);
            //         return dataObject;
            //     } else {
            //         return dataObject;
            //     }
            // })
            .then(function(dataObject){
                return self.processPracticeCustomerEngagementQuestionnaires(dataObject, rawData);
            })
            .then(function(dataObject){
                return self.processPracticeAppointmentsDefaults(dataObject, rawData);
            });
        }
    },

    processPracticeCustomerEngagementQuestionnaires: {
        value: function(dataObject, rawData) {
            var self = this,
                mainService = this.rootService,
                promise;
            console.log("start provision practice's CustomerEngagementQuestionnaires",dataObject, rawData);
            /*
                Get/Greate the customerEngagementQuestionnaires
            */
           return Promise.all([
               self.patientRolePromise,
               self.customerEngagementQuestionnaireWithNameForOrganization(self.consentQuestionnaireName, dataObject, ["rolesRequiredToComplete", "rolesOptionalToComplete"]),
               self.customerEngagementQuestionnaireWithNameForOrganization(self.supplementalHealthQuestionnaireName, dataObject, ["rolesRequiredToComplete", "rolesOptionalToComplete"])
            ])
            .then(function(resolvedValues) {
                var patientRole = resolvedValues[0];
                //We assume they're only the admittance related ones for now
                for(var i=1, countI = resolvedValues.length, iCustomerEngagementQuestionnaire; (i<countI); i++) {
                    /*
                        Set the preference based on rawData.disable_admittance_forms
                    */
                    if(!rawData.disable_admittance_forms) {
                        iCustomerEngagementQuestionnaire = resolvedValues[i];
                        iCustomerEngagementQuestionnaire.participationStatusRequiredByEvent = Event.participationStatusEmum.InvitedIn;

                        //Setup rolesRequiredToComplete
                        iCustomerEngagementQuestionnaire.rolesRequiredToComplete = [patientRole];
                        iCustomerEngagementQuestionnaire.rolesOptionalToComplete = null;

                    } else {
                        iCustomerEngagementQuestionnaire = resolvedValues[i];
                        iCustomerEngagementQuestionnaire.participationStatusRequiredByEvent = Event.participationStatusEmum.InvitedIn;

                        //Remove rolesRequiredToComplete. We'll need to test that we can remove a value from the array.
                        iCustomerEngagementQuestionnaire.rolesRequiredToComplete = null;
                        iCustomerEngagementQuestionnaire.rolesOptionalToComplete = [patientRole];
                    }
                }
                console.log("completed provision practice's CustomerEngagementQuestionnaires",dataObject, rawData);
                return dataObject;
            });
        }
    },


    processPracticeAppointmentsDefaults: {
        value: function(organization, rawData) {
            console.log("start provision practice appointments defaults",organization,rawData);

            /*
                We're going to create an Event that will model some defaults for all appointment events of a practice:
                    - participationRoles
                    - 

                That event needs to be related to the relation between an organizatin and it's customers:

                organization.b2cCustomerRelationships
                    - is a B2CCustomerSupplierRelationship, that inherits calendars from Party
                    - if B2CCustomerSupplierRelationship.customer is left open, it "models" any of them
                   
                - we create a B2CCustomerRelationship template
                    - We create a calendar template and add it to the B2CCustomerRelationship.calendars
                    - we create an event with eventAttendeeRole and patientRole
                    - we set the participationStatusExpectedTimeOffsets as defined on rawData.

                

                (An employee gets his calendar from the employmentPositionStaffing object that link it to the organizatin he works for)
            */
            var self = this,
                mainService = this.rootService,
                practicePatientRelationshipTemplateName = "PracticePatientRelationshipTemplate",
                practicePatientRelationshipTemplateCalendarName = "Customer Calendar Template",
                practicePatientRelationshipTemplate,
                practicePatientRelationshipTemplateCalendar,
                filteredB2cCustomerRelationships,
                practicePatientRelationshipTemplatePromise,
                patientAppointmentEventTemplateName = "Customer Service Engagement Event Template",
                patientAppointmentEventTemplatePromise,
                patientAppointmentEventTemplate,
                practicePatientRelationshipTemplateCriteria = new Criteria().initWithExpression("isTemplate == true && templateName == $.name", {
                    name: practicePatientRelationshipTemplateName
                });
                //query = DataQuery.withTypeAndCriteria(Role, criteria);

            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(B2CCustomerSupplierRelationship),
                this._createObjectDescriptorStoreForTypeIfNeeded(Calendar),
                this._createObjectDescriptorStoreForTypeIfNeeded(Event)
            ])
            .then((wasCreated) => {

                if(!mainService.isObjectCreated(organization)) {
                    practicePatientRelationshipTemplatePromise = mainService.getObjectProperties(organization, "b2cCustomerRelationships")
                    .then(function() {
                        filteredB2cCustomerRelationships = organization.b2cCustomerRelationships.filter(practicePatientRelationshipTemplateCriteria.predicateFunction);

                        if(filteredB2cCustomerRelationships && filteredB2cCustomerRelationships.length) {
                            if(filteredB2cCustomerRelationships.length > 1) {
                                throw "More than one PracticePatientRelationshipTemplate for organization: "+ JSON.stringify(organization);
                            }
                            practicePatientRelationshipTemplate = filteredB2cCustomerRelationships[0];
                        }

                        return practicePatientRelationshipTemplate;
                    });

                } else {
                    practicePatientRelationshipTemplatePromise = Promise.resolve();
                }

                return practicePatientRelationshipTemplatePromise;
            })
            .then(function(_practicePatientRelationshipTemplate) {
                if(!practicePatientRelationshipTemplate) {
                    practicePatientRelationshipTemplate = mainService.createDataObject(B2CCustomerSupplierRelationship);
                    practicePatientRelationshipTemplate.supplier = organization;
                    practicePatientRelationshipTemplate.isTemplate = true;
                    practicePatientRelationshipTemplate.templateName = practicePatientRelationshipTemplateName;
                    practicePatientRelationshipTemplate.templateDescription = "B2CCustomerSupplierRelationship template used for the organization's customers";
                } 

                return practicePatientRelationshipTemplate;
                
            })
            .then(function(_practicePatientRelationshipTemplate) {

                if(!mainService.isObjectCreated(practicePatientRelationshipTemplate)) {

                    return mainService.getObjectProperties(practicePatientRelationshipTemplate, "calendars")
                    .then(function() {
                        var calendarTemplateCriteria = new Criteria().initWithExpression("isTemplate == true && templateName == $.name", {
                            name: practicePatientRelationshipTemplateCalendarName
                        }),
                        filteredCalendars = practicePatientRelationshipTemplate.calendars.filter(calendarTemplateCriteria.predicateFunction);
        
                        if(filteredCalendars && filteredCalendars.length) {
                            if(filteredCalendars.length > 1) {
                                throw "More than one template Calendar named '"+practicePatientRelationshipTemplateCalendarName+"' for organization: "+ organization.name;
                            }
                            practicePatientRelationshipTemplateCalendar = filteredCalendars[0];
                        }

                        return practicePatientRelationshipTemplateCalendar;
                    });
                } else {
                    return Promise.resolve();
                }

            })
            .then(function(_practicePatientRelationshipTemplateCalendar) {
                if(!practicePatientRelationshipTemplateCalendar) {
                    /*
                        Create the calendar template for customers:
                    */
                    practicePatientRelationshipTemplateCalendar = mainService.createDataObject(Calendar);
                    practicePatientRelationshipTemplateCalendar.name = practicePatientRelationshipTemplateCalendar.templateName = practicePatientRelationshipTemplateCalendarName;
                    practicePatientRelationshipTemplateCalendar.description = practicePatientRelationshipTemplateCalendar.templateDescription = "Calendar template used for customer's appointments";
                    practicePatientRelationshipTemplateCalendar.isTemplate = true;

                    practicePatientRelationshipTemplate.calendars = [practicePatientRelationshipTemplateCalendar];    
                }

                return practicePatientRelationshipTemplateCalendar;
            })
            .then(function(_practicePatientRelationshipTemplateCalendar) {
                if(!mainService.isObjectCreated(practicePatientRelationshipTemplateCalendar)) {
                    return mainService.getObjectProperties(practicePatientRelationshipTemplateCalendar, "events")
                    .then(function() {
                        var eventTemplateCriteria = new Criteria().initWithExpression("isTemplate == true && templateName == $.name", {
                            name: patientAppointmentEventTemplateName
                        }),
                        filteredEvents = practicePatientRelationshipTemplateCalendar.events.filter(eventTemplateCriteria.predicateFunction);
        
                        if(filteredEvents && filteredEvents.length) {
                            if(filteredEvents.length > 1) {
                                throw "More than one template event named '"+patientAppointmentEventTemplateName+"' for organization: "+ organization.name;
                            }
                            patientAppointmentEventTemplate = filteredEvents[0];
                        }

                        return patientAppointmentEventTemplate;

                    });
                } else {
                    return Promise.resolve();
                }
            })
            .then(function(_patientAppointmentEventTemplate) {
                if(!patientAppointmentEventTemplate) {
                    /*
                        Create the event template for customers:
                    */
                    patientAppointmentEventTemplate = mainService.createDataObject(Event);
                    patientAppointmentEventTemplate.calendar = practicePatientRelationshipTemplateCalendar;
                    patientAppointmentEventTemplate.participationRoles = [
                        self.eventAttendeeRole,
                        self.patientRole
                    ];
                    patientAppointmentEventTemplate.templateName = patientAppointmentEventTemplateName;
                    patientAppointmentEventTemplate.templateDescription = "Event template used for customer's appointments";
                    patientAppointmentEventTemplate.isTemplate = true;
                }

                var participationStatusExpectedTimeOffsets =  patientAppointmentEventTemplate.participationStatusExpectedTimeOffsets;
                if(!participationStatusExpectedTimeOffsets) {
                    participationStatusExpectedTimeOffsets = new Map();
                    patientAppointmentEventTemplate.participationStatusExpectedTimeOffsets = participationStatusExpectedTimeOffsets;
                }


                /*
                    rawData.early_admittance_form_filling_minutes //Number in minutes
                    Check Arrived Range:
                */
                var admittanceRequirementsParticipationStatusExpectedTimeOffsets = participationStatusExpectedTimeOffsets.get(Event.participationStatusEmum.AdmittanceRequirementsCompleted),
                intakeOffsetRangeBegin = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/0, Number(rawData.max_minutes_to_allow_admittance_forms || 120)*-1, /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0),//
                intakeOffsetRangeEnd = new Duration();//Typically zero, it's relative to event's scheduledTimeRange

                var isBlank = intakeOffsetRangeEnd.blank;


                /*
                    WORKAROUND FIXME
                    In the following, we force the re-creation of a new range to set it in the map insteasd of mutating the range, because when we do:
                        1. we don't observe changes on the range, a value in a table, so we don't know it changed, so it's not being saved

                        2. We don't quite know how to tell the difference between a key/value in the map, that is it's own object stored on it's own, and therefore has triggers tracking changes, from something like a range that is mutable, but not being handled as a DataObject, where a change on it should bubble as a change on the objecy's property hosting/storing it.

                */

                    
                // if(!admittanceRequirementsParticipationStatusExpectedTimeOffsets) {
                    admittanceRequirementsParticipationStatusExpectedTimeOffsets = new Range(intakeOffsetRangeBegin, intakeOffsetRangeEnd);
                    participationStatusExpectedTimeOffsets.set(Event.participationStatusEmum.AdmittanceRequirementsCompleted, admittanceRequirementsParticipationStatusExpectedTimeOffsets);
                // } else {
                //     admittanceRequirementsParticipationStatusExpectedTimeOffsets.begin = intakeOffsetRangeBegin;
                //     admittanceRequirementsParticipationStatusExpectedTimeOffsets.end = intakeOffsetRangeEnd;
                // }
    

                /*
                    rawData.early_arrival_minutes //Number in minutes
                    Check Arrived Range:
                */
                var arrivedParticipationStatusExpectedTimeOffsets = participationStatusExpectedTimeOffsets.get(Event.participationStatusEmum.Arrived);
                
                intakeOffsetRangeBegin = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/0, Number(rawData.early_arrival_minutes)*-1, /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0);//

                /*
                    Hard code to 15mn per Dr. Sanchez until we may expose a preference.
                */
                intakeOffsetRangeEnd = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/0, 15, /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0);//Typically zero, it's relative to event's scheduledTimeRange
                    
                // if(!arrivedParticipationStatusExpectedTimeOffsets) {
                    arrivedParticipationStatusExpectedTimeOffsets = new Range(intakeOffsetRangeBegin, intakeOffsetRangeEnd);
                    participationStatusExpectedTimeOffsets.set(Event.participationStatusEmum.Arrived, arrivedParticipationStatusExpectedTimeOffsets);
                // } else {
                //     arrivedParticipationStatusExpectedTimeOffsets.begin = intakeOffsetRangeBegin;
                //     arrivedParticipationStatusExpectedTimeOffsets.end = intakeOffsetRangeEnd;
                // }


                /*
                    Check-in durations, hard-coded defaults for now until we have one to intake. Per Dr. Sanchez on 9/23/2021:  -60 minutes before, 15 minutes after 
                    Check Arrived Range:
                */
                var checkedInParticipationStatusExpectedTimeOffsets = participationStatusExpectedTimeOffsets.get(Event.participationStatusEmum.CheckedIn);
            
                intakeOffsetRangeBegin = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/-1, /*minutes*/ 0, /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0);//
                intakeOffsetRangeEnd = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/0, 15, /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0);//Typically zero, it's relative to event's scheduledTimeRange


                // if(!checkedInParticipationStatusExpectedTimeOffsets) {
                    checkedInParticipationStatusExpectedTimeOffsets = new Range(intakeOffsetRangeBegin, intakeOffsetRangeEnd);
                    participationStatusExpectedTimeOffsets.set(Event.participationStatusEmum.CheckedIn, checkedInParticipationStatusExpectedTimeOffsets);
                // } else {
                //     checkedInParticipationStatusExpectedTimeOffsets.begin = intakeOffsetRangeBegin;
                //     checkedInParticipationStatusExpectedTimeOffsets.end = intakeOffsetRangeEnd;
                // }


                
                /*
                    rawData.invite_inside_immediately //boolean 
                    rawData.max_minutes_to_wait_after_arrival //Number in minutes
                    Check Arrived Range:
                */
                var invitedInParticipationStatusExpectedTimeOffsets = participationStatusExpectedTimeOffsets.get(Event.participationStatusEmum.InvitedIn);

                intakeOffsetRangeBegin = new Duration();//Typically zero, it's relative to event's scheduledTimeRange
                intakeOffsetRangeEnd = new Duration(/* years */0, /*months*/0, /*weeks*/0, /*days*/0, /*hours*/0, /*minutes*/rawData.invite_inside_immediately ? 0 : Number((rawData.max_minutes_to_wait_after_arrival || 15)), /*seconds*/0, /* milliseconds */0, /* microseconds */0, /* nanoseconds */0);//

                    
                // if(!invitedInParticipationStatusExpectedTimeOffsets) {
                    invitedInParticipationStatusExpectedTimeOffsets = new Range(intakeOffsetRangeBegin, intakeOffsetRangeEnd);
                    participationStatusExpectedTimeOffsets.set(Event.participationStatusEmum.InvitedIn, invitedInParticipationStatusExpectedTimeOffsets);
                // } else {
                //     invitedInParticipationStatusExpectedTimeOffsets.begin = intakeOffsetRangeBegin;
                //     invitedInParticipationStatusExpectedTimeOffsets.end = intakeOffsetRangeEnd;
                // }

                return practicePatientRelationshipTemplateCalendar;
            })
            .then(function() {
                console.log("completed provision practice appointments defaults",organization,rawData);
                return organization;
            });
    
        }
    },

    createPracticeAuthentication: {
        value: function(organization) {
            var self = this;

            // return this.createCogentDesignCustomerUserPoolForOrganization(organization)
            // .then(function(userPool) {
                // return self.createCogentDesignCustomerOrgnizationUserPoolClientsForUserPool(organization, userPool)
            // })
            // .then(function() {
            //     return organization;
            // });
            self.createCogentDesignCustomerOrgnizationAppClients(organization);
            return organization;
        }
    },
    updatePracticeAuthenticationIfNeeded: {
        value: function(organization) {
            //Check if there are applications for that organization :
            var applicationCriteria = new Criteria().initWithExpression("controllingOrganization == $.controllingOrganization", {
                    controllingOrganization: organization
                }),
                applicationQuery = DataQuery.withTypeAndCriteria(Application, applicationCriteria);
    
            return this.rootService.fetchData(applicationQuery)
            .then((resultalidate) => {
                if(result.length === 0 ) {
                    return this.createPracticeAuthentication(organization);
                } else {
                    return organization;
                }
            });

        }
    },

    performLocationTypesMergeOperation: {
        value: function(mergeOperation) {
            //console.log("performLocationTypesMerge(): ",mergeOperation);
            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(EmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyEmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PostalAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPostalAddress)
            ])
            .then(() => {

                var mainService = this.rootService,
                    referrerId = mergeOperation.referrerId,
                    //Find the matching createTransaction operation:
                    createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                    // rawObjectDescriptor = mergeOperation.target,
                    // rawMapping = this.mappingForType(rawObjectDescriptor),
                    // rawDataPrimaryKeys = rawMapping.rawDataPrimaryKeys,
                    rawData = mergeOperation.data,
                    // originIdKey = rawDataPrimaryKeys[0],
                    // originIdValue = data[originIdKey],
                    originIdValue = this.originIdValueForOperation(mergeOperation),
                    objectDescriptor = mainService.objectDescriptorForType(Organization),
                    organizationOriginIdValue = mergeOperation.data.practice_id.toString(),

                    self = this,

                /*
                    Question: What do w do with         "use_own_mailing_address" : true,
                */

                    organizationDescriptor = mainService.objectDescriptorForType(Organization),
                    rawCountryDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/country_types"),
                    rawPracticeDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/practice"),
                    countryDescriptor = mainService.objectDescriptorForType(Country),
                    parentOrganization,
                    organization,
                    practiceOriginId = rawData.practice_id.toString(),
                    practiceOperation = this.operationForTypeOriginIdInCreateTransactionOperation(rawPracticeDescriptor, practiceOriginId, createTransactionOperation),
                    organizationRawData = practiceOperation && practiceOperation.data,
                    // organizationRawData = createTransactionOperation.operationsByOriginId.get(practiceOriginId).data,
                    country,

                    countryId = rawData.country_id === 0 ? 26 : rawData.country_id;

                //First get the top Organization/Practice
                return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationDescriptor, practiceOriginId, createTransactionOperation, ["emailAddresses", "postalAddresses","phoneNumbers"])
                .then(function(_organization) {
                    parentOrganization = _organization;

                    //Second get the Organization for this location
                    return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationDescriptor, rawData.type_id, createTransactionOperation);
                })
                .then(function(_organization) {
                    organization = _organization;

                    if(organization) {
                        return mainService.getObjectProperties(organization, "emailAddresses", "postalAddresses","phoneNumbers");
                    } else {
                        return Promise.resolveNull;
                    }
                })
                .then(function(resolvedValue) {
                    return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(countryDescriptor, countryId, createTransactionOperation, rawCountryDescriptor);
                })
                .then(function(_country) {
                    var timeZonePromise;

                    if(!_country) {
                        throw "Couldn't find country with originId "+countryId;
                    }

                    if(!organization) {
                        organization =  mainService.createDataObject(Organization);
                        organization.name = rawData.permanent_label;
                        organization.originId = rawData.type_id.toString();
                        organization.parent = parentOrganization;
                    }

                    country = _country;

                    var postalAddress,
                        practicePostalAddress,
                        practicePostalAddresses = organization.postalAddresses,
                        practicePostalAddressPromises = [],

                        emailAddress,
                        practiceEmailAddress,
                        practiceEmailAddresses = organization.emailAddresses,
                        practiceEmailAddressPromises = [],

                        phoneNumber,
                        practicePhoneNumber,
                        practicePhoneNumbers = organization.phoneNumbers,
                        practicePhoneNumberPromises = [],

                        rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date),
                        rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date),
                        
                        timeZoneIdentifier;


                    if(rawData.email) {

                        if(practiceEmailAddresses && practiceEmailAddresses.length > 0) {
                            //We have email addresses.
                            var practiceEmailAddressCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                                    label: rawData.type_label,
                                    originId: rawData.type_id
                                }),
                                filteredPracticeEmailAddresses = practiceEmailAddresses.filter(practiceEmailAddressCriteria.predicateFunction);

                                if(filteredPracticeEmailAddresses && filteredPracticeEmailAddresses.length) {
                                    if(filteredPracticeEmailAddresses.length > 1) {
                                        throw "More than one PartyEmail with label: '"+rawData.type_label+"' and originId: '"+rawData.type_id+"'";
                                    }
                                    practiceEmailAddress = filteredPracticeEmailAddresses[0];
                                    emailAddress = practiceEmailAddress.messagingChannel;
                                }
                        }

                        if(!practiceEmailAddress) {
                            practiceEmailAddress = mainService.createDataObject(PartyEmailAddress);
                            practiceEmailAddress.label = rawData.type_label;
                            practiceEmailAddress.originId = rawData.type_id;    

                            /*
                                Take care of PartyPostalAddress on Organization
                            */
                            if(practiceEmailAddresses) {
                                practiceEmailAddresses.push(practiceEmailAddress);
                            } else {
                                organization.emailAddresses = practiceEmailAddresses = [practiceEmailAddress];
                            }

                        } else if(practiceEmailAddress.label !== rawData.type_label) {
                            practiceEmailAddress.label = rawData.type_label;
                        }

                        if(!emailAddress) {
                            emailAddress = mainService.createDataObject(EmailAddress);
                            emailAddress.email = rawData.email;
                            emailAddress.originId = rawData.type_id;

                            practiceEmailAddress.messagingChannel = emailAddress;    
                        } else if(emailAddress.originId !== rawData.type_id){
                            emailAddress.email = rawData.email;
                        }


                        if(rawDataCreationDate) {
                            emailAddress.creationDate = rawDataCreationDate;
                            practiceEmailAddress.creationDate = rawDataCreationDate;
                        }
                        if(rawDataModificationDate) {
                            emailAddress.modificationDate = rawDataModificationDate;
                            practiceEmailAddress.modificationDate = rawDataModificationDate;
                        }

                    }

                    if(rawData.website) {
                        organization.urlAddresses = [rawData.website];
                    }

                    if(rawData.phone) {

                        //Check if we have one
                        if(practicePhoneNumbers && practicePhoneNumbers.length > 0) {

                            var practicePhoneNumberCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                                label: rawData.type_label,
                                originId: rawData.type_id
                            }),
                            filteredPracticePhoneNumbers = practicePhoneNumbers.filter(practicePhoneNumberCriteria.predicateFunction);

                            if(filteredPracticePhoneNumbers && filteredPracticePhoneNumbers.length) {
                                if(filteredPracticePhoneNumbers.length > 1) {
                                    throw "More than one PartyPhoneNumber with label: '"+rawData.type_label+"' and originId: '"+rawData.type_id+"'";
                                }
                                practicePhoneNumber = filteredPracticePhoneNumbers[0];
                                phoneNumber = practicePhoneNumber.messagingChannel;
                            }
                        } 

                        if(!practicePhoneNumber) {
                            practicePhoneNumber = mainService.createDataObject(PartyPhoneNumber);
                            practicePhoneNumber.label = rawData.type_label;
                            practicePhoneNumber.originId = rawData.type_id;

                            /*
                                Take care of PartyPhoneNumber on Organization
                            */
                            if(practicePhoneNumbers) {
                                practicePhoneNumbers.push(practicePhoneNumber);
                            } else {
                                organization.phoneNumbers = practicePhoneNumbers = [practicePhoneNumber];
                            }
                        }

                        if(!phoneNumber) {
                            phoneNumber = mainService.createDataObject(PhoneNumber);
                            //Should match country.phoneCode
                            phoneNumber.countryCode = rawData.phone_country_code;

                            // practicePhoneNumber.label = rawData.type_label;
                            //Seems to come as "phone" : "770-645-2488",
                            phoneNumber.nationalNumber = rawData.phone.split("-").join("");
                            phoneNumber.originId = rawData.type_id;

                            practicePhoneNumber.messagingChannel = phoneNumber;
                        } else if(phoneNumber.originId !== rawData.type_id){
                            phoneNumber.countryCode = rawData.phone_country_code;
                            // practicePhoneNumber.label = rawData.type_label;
                            //Seems to come as "phone" : "770-645-2488",
                            phoneNumber.nationalNumber = rawData.phone.split("-").join("");
                            phoneNumber.originId = rawData.type_id;
                        }


                        if(rawDataCreationDate) {
                            if(phoneNumber.creationDate.getTime() !== rawDataCreationDate.getTime()) {
                                phoneNumber.creationDate = rawDataCreationDate;
                                practicePhoneNumber.creationDate = rawDataCreationDate;
                            }
                        }
                        if(rawDataModificationDate) {
                            if(phoneNumber.modificationDate.getTime() !== rawDataModificationDate.getTime()) {
                                phoneNumber.modificationDate = rawDataModificationDate;
                                practicePhoneNumber.modificationDate = rawDataModificationDate;
                            }
                        }

                    }

                    /* 
                        Postal Raw Data:

                                "post_code" : "30342",
                                "country_id" : 26,
                                "city" : "Atlanta",
                                "state_province" : "GA",
                                "street_address" : "5555 Peachtree Dunwoody Rd NE",
                    */

                    if(rawData.street_address) {

                        //Check if we have one
                        if(practicePostalAddresses && practicePostalAddresses.length > 0) {
                            var practicePostalAddressCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                                label: rawData.permanent_label,
                                originId: rawData.type_id
                            }),
                            filteredPracticePostalAddresses = practicePostalAddresses.filter(practicePostalAddressCriteria.predicateFunction);

                            if(filteredPracticePostalAddresses && filteredPracticePostalAddresses.length) {
                                if(filteredPracticePostalAddresses.length > 1) {
                                    throw "More than one PartyPostalAddress with label: '"+rawData.permanent_label+"' and originId: '"+rawData.type_id+"'";
                                }
                                practicePostalAddress = filteredPracticePostalAddresses[0];
                                postalAddress = practicePostalAddress.messagingChannel;
                            }

                        }

                        if(!practicePostalAddress) {
                            practicePostalAddress = mainService.createDataObject(PartyPostalAddress);
                            practicePostalAddress.label = rawData.permanent_label;
                            practicePostalAddress.originId = rawData.type_id;

                            /*
                                Take care of PartyPostalAddress on Organization
                            */
                            if(practicePostalAddresses) {
                                practicePostalAddresses.push(practicePostalAddress);
                            } else {
                                organization.postalAddresses = practicePostalAddresses = [practicePostalAddress];
                            }

                            if(!practicePostalAddress.party) {
                                console.log("inverse didn't work?");
                            }
                        }


                        if(!postalAddress) {
                            postalAddress = mainService.createDataObject(PostalAddress);
                            practicePostalAddress.messagingChannel = postalAddress;

                            // postalAddress.addressee = organization.name;
                            postalAddress.streetAddress = rawData.street_address;
                            postalAddress.locality = rawData.city;
                            postalAddress.primaryPostalCode = rawData.post_code;
                            postalAddress.administrativeArea = rawData.state_province;
                            postalAddress.country = country;
                            postalAddress.originId = rawData.type_id;

                        } else if(postalAddress.originId !== rawData.type_id){
                            // postalAddress.addressee = organization.name;
                            postalAddress.streetAddress = rawData.street_address;
                            postalAddress.locality = rawData.city;
                            postalAddress.primaryPostalCode = rawData.post_code;
                            postalAddress.administrativeArea = rawData.state_province;
                            postalAddress.country = country;
                            postalAddress.originId = rawData.type_id;
                        }

                        if((timeZoneIdentifier = (rawData.timezone_name || (organizationRawData && organizationRawData.timezone) || (parentOrganization && parentOrganization.postalAddresses && parentOrganization.postalAddresses[0])))) {
                            /*
                                Cleanup, we should set a TimeZone instance, not the identifier.
                                It's ok for now as we should store the identifier in the DB, but 
                                we should add the missing converter sooner than later.
                            */
                            timeZonePromise = TimeZone.withIdentifier(timeZoneIdentifier)
                            .then((timeZone) => {
                                if(timeZone) {
                                    postalAddress.timeZone = timeZone;
                                }
                            });
                        } else {
                            timeZonePromise = Promise.resolve();
                        } 

                        if(rawDataCreationDate) {
                            postalAddress.creationDate = rawDataCreationDate;
                            practicePostalAddress.creationDate = rawDataCreationDate;
                        }

                        if(rawDataModificationDate) {
                            if(postalAddress.modificationDate.getTime() !== rawDataModificationDate.getTime()) {
                                postalAddress.modificationDate = rawDataModificationDate;
                                practicePostalAddress.modificationDate = rawDataModificationDate;
                            }
                        }

                        if(rawData.longitude && rawData.latitude) {
                            var shouldUpdate = false,
                                coordinates;
                            if(postalAddress.location) {
                                coordinates = postalAddress.location.coordinates;

                                //I don't think we're capable of detecting a change on a location's propety as a change on postalAddress, which is needed as that's where it's stored
                                if(postalAddress.location.coordinates.longitude !== rawData.longitude) {
                                    shouldUpdate = true;
                                }
                                if(postalAddress.location.coordinates.latitude !== rawData.latitude) {
                                    shouldUpdate = true;
                                }
                            } else {
                                shouldUpdate = true;
                            }
                            if(shouldUpdate) {
                                //For geodetic coordinates, X is longitude and Y is latitude
                                var practicePosition = GeoPoint.withCoordinates([/* longitude */rawData.longitude,/* latitude */rawData.latitude, /* altitude */0] ,defaultProjection);

                                postalAddress.location = practicePosition;
                                }
                        }
                    }

                    return timeZonePromise.
                    then(function() {
                        return Promise.resolve(organization);
                    });

                });
            });
        }
    },

    // performLocationTypesMerge: {
    //     value: function(mergeOperation) {
    //         console.log("handleLocationTypesMerge(): ",mergeOperation);
    //         var mainService = this.rootService,
    //             referrerId = mergeOperation.referrerId,
    //             //Find the matching createTransaction operation:
    //             createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
    //             // rawObjectDescriptor = mergeOperation.target,
    //             // rawMapping = this.mappingForType(rawObjectDescriptor),
    //             // rawDataPrimaryKeys = rawMapping.rawDataPrimaryKeys,
    //             data = mergeOperation.data,
    //             // originIdKey = rawDataPrimaryKeys[0],
    //             // originIdValue = data[originIdKey],
    //             originIdValue = this.originIdValueForOperation(mergeOperation),
    //             organizationOriginIdValue = mergeOperation.data.practice_id.toString(),
    //             objectDescriptor = mainService.objectDescriptorForType(Organization),
    //             self = this;

    //         return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(objectDescriptor, organizationOriginIdValue, createTransactionOperation)
    //         .then(function(result) {
    //             if(!result || result.length === 0) {
    //                 return self._createLocationTypes(data, originIdValue, createTransactionOperation);
    //             } else {
    //                 return self.updateLocationTypes(result[0],data);
    //             }
    //         });
    //     }
    // },
    // createLocationTypes: {
    //     value: function(rawData, originId, createTransactionOperation) {
    //         console.log("createLocationTypes",rawData);


    //         /*
    //             Question: What do w do with         "use_own_mailing_address" : true,


    //         */

    //         var self = this,
    //             organizationDescriptor = mainService.objectDescriptorForType(Organization),
    //             rawCountryDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/country_types"),
    //             countryDescriptor = mainService.objectDescriptorForType(Country),
    //             organization,
    //             organizationRawData = createTransactionOperation.operationsByOriginId.get(rawData.practice_id).data,
    //             country;

    //         //First get the Organization/Practice
    //         return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationDescriptor, rawData.practice_id.toString(), createTransactionOperation)
    //         .then(function(_organization) {
    //             organization = _organization;
    //             return this.service.getObjectProperties(organization, "emailAddresses", "postalAddresses","phoneNumbers")
    //         })
    //         .then(function(resolvedValue) {
    //             return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(countryDescriptor, rawData.country_id, createTransactionOperation, rawCountryDescriptor)
    //         }
    //         .then(function(_country) {

    //             if(!_country) {
    //                 throw "Couldn't find country with originId "+country_id;
    //             }

    //             country = _country;

    //             var mainService = this.rootService,
    //                 postalAddress,
    //                 practicePostalAddress,
    //                 practicePostalAddresses = organization.postalAddresses,

    //                 emailAddress,
    //                 practiceEmailAddress,
    //                 practiceEmailAddresses = organization.emailAddresses,

    //                 phoneNumber,
    //                 practicePhoneNumber,
    //                 practicePhoneNumbers = organization.phoneNumbers,
    //                 timeZone;


    //             if(rawData.email) {

    //                 if(practiceEmailAddresses && practiceEmailAddresses.length > 0) {
    //                     //We have email addresses.
    //                     var criteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
    //                             label: rawData.permanent_label,
    //                             originId: rawData.type_id
    //                         }),
    //                         filteredPracticeEmailAddresses = practiceEmailAddresses.filter(criteria.evaluate);

    //                         if(filteredPracticeEmailAddresses && filteredPracticeEmailAddresses.length) {
    //                             if(filteredPracticeEmailAddresses.length > 1) {
    //                                 throw "More than one PartyEmail with label: '"+rawData.permanent_label+"' and originId: '"+rawData.type_id+"'";
    //                             }
    //                             practiceEmailAddress = filteredPracticeEmailAddresses[0];
    //                             emailAddress = practiceEmailAddress.messagingChannel;
    //                         }
    //                 }

    //                 if(!practiceEmailAddress) {
    //                     practiceEmailAddress = mainService.createDataObject(PartyPostalAddress);
    //                     practiceEmailAddress.label = rawData.permanent_label;
    //                     practiceEmailAddress.originId = rawData.type_id;    

    //                     /*
    //                         Take care of PartyPostalAddress on Organization
    //                     */
    //                     if(practiceEmailAddresses) {
    //                         practiceEmailAddresses.push(practiceEmailAddress)
    //                     } else {
    //                         organization.emailAddresses = practiceEmailAddresses = [practiceEmailAddress];
    //                     }

    //                 } else if(practiceEmailAddress.label !== rawData.permanent_label) {
    //                     practiceEmailAddress.label = rawData.permanent_label;
    //                 }

    //                 if(!emailAddress) {
    //                     emailAddress = mainService.createDataObject(EmailAddress);
    //                     emailAddress.email = rawData.email;
    //                     emailAddress.originId = rawData.type_id;
    
    //                     practiceEmailAddress.messagingChannel = emailAddress;    
    //                 } else if(emailAddress.originId !== rawData.type_id){
    //                     emailAddress.email = rawData.email;
    //                 }


    //                 if(rawData.created_date) {
    //                     emailAddress.creationDate = new Date(rawData.created_date*1000);
    //                     practiceEmailAddress.creationDate = emailAddress.creationDate;
    //                 }
    //                 if(rawData.last_modified_date) {
    //                     emailAddress.modificationDate = new Date(rawData.last_modified_date*1000);
    //                     practiceEmailAddress.modificationDate = emailAddress.modificationDate;
    //                 }
    
    //             }

    //             if(rawData.website) {
    //                 organization.urlAddresses = [rawData.website];
    //             }

    //             if(rawData.phone) {
    //                 phoneNumber = mainService.createDataObject(PhoneNumber);

    //                 //Should match country.phoneCode
    //                 phoneNumber.countryCode = rawData.phone_country_code;

    //                 // practicePhoneNumber.label = rawData.type_label;
    //                 //Seems to come as "phone" : "770-645-2488",
    //                 phoneNumber.nationalNumber = rawData.phone.split("-").join("");
    //                 phoneNumber.originId = rawData.type_id;

    //                 practicePhoneNumber = mainService.createDataObject(PartyPhoneNumber);
    //                 practicePhoneNumber.label = rawData.permanent_label;
    //                 practicePhoneNumber.messagingChannel = phoneNumber;
    //                 practicePhoneNumber.originId = rawData.type_id;

    //                 if(rawData.created_date) {
    //                     phoneNumber.creationDate = new Date(rawData.created_date*1000);
    //                     practicePhoneNumber.creationDate = phoneNumber.creationDate;
    //                 }
    //                 if(rawData.last_modified_date) {
    //                     phoneNumber.modificationDate = new Date(rawData.last_modified_date*1000);
    //                     practicePhoneNumber.modificationDate = phoneNumber.modificationDate;
    //                 }
    
    //                 /*
    //                     Take care of PartyPostalAddress on Organization
    //                 */
    //                if(practicePhoneNumbers) {
    //                     practicePhoneNumbers.push(practicePhoneNumber)
    //                 } else {
    //                     organization.phoneNumbers = practicePhoneNumbers = [practicePhoneNumber];
    //                 }
    //             }

    //             if((timeZone = (rawData.timezone_name || organizationRawData.timezone))) {
    //                 /*
    //                     Cleanup, we should set a TimeZone instance, not the identifier.
    //                     It's ok for now as we should store the identifier in the DB, but 
    //                     we should add the missing converter sooner than later.
    //                 */
    //                 practicePostalAddress.timeZone = timeZone;
    //             }

    //             /* 
    //                 Postal Raw Data:

    //                         "post_code" : "30342",
    //                         "country_id" : 26,
    //                         "city" : "Atlanta",
    //                         "state_province" : "GA",
    //                         "street_address" : "5555 Peachtree Dunwoody Rd NE",
    //             */

    //            postalAddress = mainService.createDataObject(PostalAddress);
    //            practicePostalAddress = mainService.createDataObject(PartyPostalAddress);

    //             practicePostalAddress.label = rawData.permanent_label;
    //             practicePostalAddress.messagingChannel = postalAddress;
    //             practicePostalAddress.originId = rawData.type_id;

    //             // postalAddress.addressee = organization.name;
    //             postalAddress.streetAddress = rawData.street_address;
    //             postalAddress.locality = rawData.city;
    //             postalAddress.primaryPostalCode = rawData.post_code;
    //             postalAddress.administrativeArea = rawData.state_province;
    //             postalAddress.country = country;
    //             postalAddress.originId = rawData.type_id;

    //             if(rawData.created_date) {
    //                 postalAddress.creationDate = new Date(rawData.created_date*1000);
    //                 practicePostalAddress.creationDate = postalAddress.creationDate;
    //             }
    //             if(rawData.last_modified_date) {
    //                 postalAddress.modificationDate = new Date(rawData.last_modified_date*1000);
    //                 practicePostalAddress.modificationDate = postalAddress.modificationDate;
    //             }


    //             /*
    //                 Take care of PartyPostalAddress on Organization
    //             */
    //             if(practicePostalAddresses) {
    //                 practicePostalAddresses.push(practicePostalAddress)
    //             } else {
    //                 organization.postalAddresses = practicePostalAddresses = [practicePostalAddress];
    //             }

    //             //For geodetic coordinates, X is longitude and Y is latitude
    //             var practicePosition = GeoPoint.withCoordinates([/* longitude */-149.567452,/* latitude */-17.535409, /* altitude */0] ,defaultProjection);

    //             postalAddress.location = practicePosition;


    //             return organization;

    //         });
    //     }
    // },


    performProcedureTypesMergeOperation: {
        value: function(mergeOperation) {
            //console.log("handleProcedureTypesMerge(): ",mergeOperation);

            var mainService = this.rootService,
                referrerId = mergeOperation.referrerId,
                //Find the matching createTransaction operation:
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                // rawObjectDescriptor = mergeOperation.target,
                // rawMapping = this.mappingForType(rawObjectDescriptor),
                data = mergeOperation.data,
                // originIdKey = rawDataPrimaryKeys[0],
                // originIdValue = data[originIdKey],
                originIdValue = this.originIdValueForOperation(mergeOperation),
                objectDescriptor = mainService.objectDescriptorForType(Service),
                self = this;

            return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(objectDescriptor, originIdValue, createTransactionOperation)
            .then(function(procedureType) {
                if(!procedureType) {
                    return self.createProcedureTypes(data, originIdValue, createTransactionOperation);
                } else {
                    return self.updateProcedureTypes(procedureType,data, createTransactionOperation);
                }
            });
        }
    },
    createProcedureTypes: {
        value: function(rawData, originIdValue, createTransactionOperation) {
            //console.log("createProcedureTypes",rawData);

            var self = this,
                mainService = this.rootService,
                phrontObjectDescriptor = mainService.objectDescriptorForType(Organization),
                customerEngagementConsentQuestionnaire,
                customerEngagementSupplementalHealthQuestionnaire,
                practice;


            return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontObjectDescriptor, rawData.practice_id, createTransactionOperation, null, ["customerEngagementQuestionnaires"])
            .then(function(_practice) {
                practice = _practice;
                return self.customerEngagementQuestionnaireWithNameForOrganization(self.consentQuestionnaireName, practice)
            })
            .then((value) => {
                customerEngagementConsentQuestionnaire = value;
                return self.customerEngagementQuestionnaireWithNameForOrganization(self.supplementalHealthQuestionnaireName, practice);
            })
            .then((value) => {
                customerEngagementSupplementalHealthQuestionnaire = value;
                return Promise.all([
                        this._createObjectDescriptorStoreForTypeIfNeeded(Service),
                        this._createObjectDescriptorStoreForTypeIfNeeded(ServiceProductVariant)
                ]);
            })
            .then(function(){
                var service = mainService.createDataObject(Service),
                    variant = mainService.createDataObject(ServiceProductVariant);

                if(!practice.customerEngagementQuestionnaires) {
                    practice.customerEngagementQuestionnaires = [];
                }
                if(practice.customerEngagementQuestionnaires.indexOf(customerEngagementConsentQuestionnaire) === -1) {
                    practice.customerEngagementQuestionnaires.push(customerEngagementConsentQuestionnaire);
                }
                if(practice.customerEngagementQuestionnaires.indexOf(customerEngagementSupplementalHealthQuestionnaire) === -1) {
                    practice.customerEngagementQuestionnaires.push(customerEngagementSupplementalHealthQuestionnaire);
                }

                /*
                    We originally had this, adding serviceQuestionnaire which allows to model what questionnaire an organization wants to use for selling a service, should probably trigger a re-factor into an organization-product relationship where a bunch of things would move to:
                        - price?
                        - stock for tangible products
                        - ...
                    It's the difference a single organization model to one where multiple orgnizations could sell the same product/service, which even for service we might want to expose as one to streamline purchase experience for shoppers. Then there are variations per vendors. So "vendor" maybe become one of the aspects of a variant? or we need {organization,service} and {oeganization,service,varianr} ? 
                */
                service.vendor = practice;

                service.originId = rawData.type_id;
                variant.originId = rawData.type_id;
                if(rawData.permanent_label !== rawData.type_label ) {
                    service.title = rawData.type_label;
                    variant.title = rawData.type_label;
                } else {
                    service.title = rawData.permanent_label;
                    variant.title = rawData.permanent_label;
                }

                if(rawData.emergency_flag) {
                    variant.isEmergencyService = true;
                }

                variant.duration = rawData.total_time;
                service.variants = [variant];
                service.customerEngagementQuestionnaires = [customerEngagementConsentQuestionnaire, customerEngagementSupplementalHealthQuestionnaire];

                if(rawData.created_date) {
                    service.creationDate = self.dateFromUnixTimestamp(rawData.created_date);
                }
                if(rawData.last_modified_date) {
                    service.modificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);
                }

                return Promise.resolve(service);    
            });
        
        }
    },
    updateProcedureTypes: {
        value: function(dataObject, rawData) {
           console.log("updateProcedureTypes (NoOp)",dataObject,rawData);
            var mainService = this.rootService;
            return Promise.resolve(dataObject);
        }
    },


    createPerson: {
        value: function(rawData, originIdValue, createTransactionOperation) {
            //console.log("createPerson(): ",rawData);

            var mainService = this.rootService,
                self = this,
                rawCountryDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/country_types"),
                rawPhoneLabelObjectDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/phone_label_types"),
                organizationObjectDescriptor = mainService.objectDescriptorForType(Organization),
                practice,
                roleObjectDescriptor = mainService.objectDescriptorForType(Role),
                role,
                countryObjectDescriptor = mainService.objectDescriptorForType(Country),
                country,
                // countryObjectDescriptor = mainService.objectDescriptorForType(Country),
                countryPromise,
                gender,
                genderObjectDescriptor = mainService.objectDescriptorForType(Gender),
                rawGenderDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/gender_types"),
                countryId = rawData.country_id === 0 ? 26 : rawData.country_id,
                genderPromise;


            if(countryId) {

                countryPromise = self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(countryObjectDescriptor, countryId, createTransactionOperation, rawCountryDescriptor);
            } else {
                countryPromise = Promise.resolveNull;
            }

            if(rawData.gender_id) {
                genderPromise = self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(genderObjectDescriptor, rawData.gender_id, createTransactionOperation, rawGenderDescriptor);
            } else {
                genderPromise = Promise.resolveNull;
            }

            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(Person),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyEmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(EmailAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPostalAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PostalAddress),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartyPhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PhoneNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(PartySMSNumber),
                this._createObjectDescriptorStoreForTypeIfNeeded(RoleRanking)
            ])
            .then(function() {
                return countryPromise
                .then(function(_country) {
                    country = _country;

                    return genderPromise;
                });
            })
            .then(function(_gender) {
                gender = _gender;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationObjectDescriptor, rawData.practice_id.toString(), createTransactionOperation);
            })
            .then(function(_practice){
                practice = _practice;

                var phoneLabelPromises = [];

                if(rawData.phone_label_a_id) {
                    phoneLabelPromises.push(
                        self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.phone_label_a_id, createTransactionOperation, rawPhoneLabelObjectDescriptor)
                    );
                } 
                if(rawData.phone_label_b_id) {
                    phoneLabelPromises.push(
                        self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.phone_label_b_id, createTransactionOperation, rawPhoneLabelObjectDescriptor)
                    );
                } 
                if(rawData.phone_label_c_id) {
                    phoneLabelPromises.push(
                        self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.phone_label_c_id, createTransactionOperation, rawPhoneLabelObjectDescriptor)
                    );
                } 
                if(rawData.phone_label_c_id) {
                    phoneLabelPromises.push(
                        self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.phone_label_c_id, createTransactionOperation, rawPhoneLabelObjectDescriptor)
                    );
                } 

                if(phoneLabelPromises.length) {
                    return Promise.all(phoneLabelPromises);
                } else {
                    return Promise.resolveNull;
                }
            })
            .then(function(resolvedPhoneLabels) {

                var person = mainService.createDataObject(Person),
                    personName = new PersonName(),
                    rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date),
                    rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);

                //Name
                person.name = personName;
                person.originId = rawData.person_id;
                personName.namePrefix = rawData.title;
                personName.givenName = rawData.first_name;
                personName.familyName = rawData.last_name;
                if(rawData.short_name) {
                    personName.nickname = rawData.short_name;
                }

                if(rawDataCreationDate) {
                    person.creationDate = rawDataCreationDate;
                }
                if(rawDataModificationDate) {
                    person.modificationDate = rawDataModificationDate;
                }


                //gender
                if(gender) {
                    person.gender = gender;
                }


                //Contact Info / messaging Channels
                if(!country && countryId) {
                    throw "Couldn't find country with originId "+countryId;
                }

                var postalAddress,
                    personPostalAddress,
                    personPostalAddresses = person.postalAddresses,
                    personPostalAddressPromises = [],

                    emailAddress,
                    personEmailAddress,
                    personEmailAddrpersoness,
                    personEmailAddresses = person.emailAddresses,
                    personEmailAddressPromises = [],

                    phoneNumber,
                    personPhoneNumber,
                    personPhoneNumbers = person.phoneNumbers,
                    personPhoneNumberPromises = [],

                    timeZone;


                if(rawData.email) {

                    if(personEmailAddresses && personEmailAddresses.length > 0) {
                        //We have email addresses.
                        var personEmailAddressCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                                label: (rawData.permanent_label || "home"),
                                originId: rawData.person_id
                            }),
                            filteredPersonEmailAddresses = personEmailAddresses.filter(personEmailAddressCriteria.predicateFunction);

                            if(filteredPersonEmailAddresses && filteredPersonEmailAddresses.length) {
                                if(filteredPersonEmailAddresses.length > 1) {
                                    throw "More than one PartyEmail with label: '"+rawData.permanent_label+"' and originId: '"+rawData.person_id+"'";
                                }
                                personEmailAddress = filteredPersonEmailAddresses[0];
                                emailAddress = personEmailAddress.messagingChannel;
                            }
                    }

                    if(!personEmailAddress) {
                        personEmailAddress = mainService.createDataObject(PartyEmailAddress);
                        personEmailAddress.label = (rawData.permanent_label || "home");
                        personEmailAddress.originId = rawData.person_id;    

                        /*
                            Take care of PartyPostalAddress on Person
                        */
                        if(personEmailAddresses) {
                            personEmailAddresses.push(personEmailAddress);
                        } else {
                            person.emailAddresses = personEmailAddresses = [personEmailAddress];
                        }

                    } else if(personEmailAddress.label !== rawData.permanent_label) {
                        personEmailAddress.label = rawData.permanent_label;
                    }

                    if(!emailAddress) {
                        emailAddress = mainService.createDataObject(EmailAddress);
                        emailAddress.email = rawData.email;
                        emailAddress.originId = rawData.person_id;

                        personEmailAddress.messagingChannel = emailAddress;    
                    } else if(emailAddress.originId !== rawData.person_id){
                        emailAddress.email = rawData.email;
                    }


                    if(rawDataCreationDate) {
                        emailAddress.creationDate = rawDataCreationDate;
                        personEmailAddress.creationDate = rawDataCreationDate;
                    }
                    if(rawDataModificationDate) {
                        emailAddress.modificationDate = rawDataModificationDate;
                        personEmailAddress.modificationDate = rawDataModificationDate;
                    }

                }

                if(rawData.phone_a) {
                    self._mergePartyPhoneComponents(person, rawData.phone_label_a_id, rawData.phone_country_code_a, rawData.phone_a, rawData.person_id, createTransactionOperation, rawDataCreationDate, rawDataModificationDate, 1);
                }
                if(rawData.phone_b) {
                    self._mergePartyPhoneComponents(person, rawData.phone_label_b_id, rawData.phone_country_code_b, rawData.phone_b, rawData.person_id, createTransactionOperation, rawDataCreationDate, rawDataModificationDate, 2);
                }
                if(rawData.phone_c) {
                    self._mergePartyPhoneComponents(person, rawData.phone_label_c_id, rawData.phone_country_code_c, rawData.phone_c, rawData.person_id, createTransactionOperation, rawDataCreationDate, rawDataModificationDate, 3);
                }
                if(rawData.phone_d) {
                    self._mergePartyPhoneComponents(person, rawData.phone_label_d_id, rawData.phone_country_code_d, rawData.phone_d, rawData.person_id, createTransactionOperation, rawDataCreationDate, rawDataModificationDate, 4);
                }

                /* 
                    Postal Raw Data:

                            "post_code" : "30342",
                            "country_id" : 26,
                            "city" : "Atlanta",
                            "state_province" : "GA",
                            "street_address" : "5555 Peachtree Dunwoody Rd NE",
                */

                if(rawData.street_address) {

                    //Check if we have one
                    if(personPostalAddresses && personPostalAddresses.length > 0) {
                        var personPostalAddressCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                            label: (rawData.permanent_label || home),
                            originId: rawData.person_id
                        }),
                        filteredPersonPostalAddresses = personPostalAddresses.filter(personPostalAddressCriteria.predicateFunction);

                        if(filteredPersonPostalAddresses && filteredPersonPostalAddresses.length) {
                            if(filteredPersonPostalAddresses.length > 1) {
                                throw "More than one PartyPostalAddress with label: '"+rawData.permanent_label+"' and originId: '"+rawData.person_id+"'";
                            }
                            personPostalAddress = filteredPersonPostalAddresses[0];
                            postalAddress = personPostalAddress.messagingChannel;
                        }

                    }

                    if(!personPostalAddress) {
                        personPostalAddress = mainService.createDataObject(PartyPostalAddress);
                        personPostalAddress.label = rawData.permanent_label || "home";
                        personPostalAddress.originId = rawData.person_id;

                        /*
                            Take care of PartyPostalAddress on Person
                        */
                        if(personPostalAddresses) {
                            personPostalAddresses.push(personPostalAddress);
                        } else {
                            person.postalAddresses = personPostalAddresses = [personPostalAddress];
                        }
                    }


                    if(!postalAddress) {
                        postalAddress = mainService.createDataObject(PostalAddress);
                        personPostalAddress.messagingChannel = postalAddress;

                        postalAddress.addressee = person.name.toString();
                        postalAddress.streetAddress = rawData.street_address;
                        postalAddress.locality = rawData.city;
                        postalAddress.primaryPostalCode = rawData.post_code;
                        postalAddress.administrativeArea = rawData.state_province;
                        postalAddress.country = country;
                        postalAddress.originId = rawData.person_id;

                    } else if(postalAddress.originId !== rawData.person_id){
                        postalAddress.addressee = person.name.toString();
                        postalAddress.streetAddress = rawData.street_address;
                        postalAddress.locality = rawData.city;
                        postalAddress.primaryPostalCode = rawData.post_code;
                        postalAddress.administrativeArea = rawData.state_province;
                        postalAddress.country = country;
                        postalAddress.originId = rawData.person_id;
                    }

                    /* 
                        8/26/2021 - I'm not sure there are actually a timezone_name on a person's raw data
                    */
                    if((timeZone = (rawData.timezone_name /*|| organizationRawData.timezone*/))) {
                        /*
                            Cleanup, we should set a TimeZone instance, not the identifier.
                            It's ok for now as we should store the identifier in the DB, but 
                            we should add the missing converter sooner than later.
                        */
                        postalAddress.timeZone = timeZone;
                    }    
                    

                    if(rawDataCreationDate) {
                        postalAddress.creationDate = rawDataCreationDate;
                        personPostalAddress.creationDate = rawDataCreationDate;
                    }
                    if(rawDataModificationDate) {
                        if(postalAddress.modificationDate.getTime() !== rawDataModificationDate.getTime()) {
                            postalAddress.modificationDate = rawDataModificationDate;
                            personPostalAddress.modificationDate = rawDataModificationDate;
                        }
                    }

                    // //For geodetic coordinates, X is longitude and Y is latitude
                    // var postalAddressPosition = GeoPoint.withCoordinates([/* longitude */-149.567452,/* latitude */-17.535409, /* altitude */0] ,defaultProjection);

                    // postalAddress.location = postalAddressPosition;
                }



                return Promise.resolve(person);
    
            });

        }
    },

    _mergePartyPhoneComponents: {
        value: function(party, labelId, countryCode, rawPhoneNumber, originId, createTransactionOperation, rawDataCreationDate, rawDataModificationDate, customerPreferenceRanking) {
            var mainService = this.rootService,
                partyPhoneNumbers = party.phoneNumbers,
                partyPhoneNumber,
                partySMSNumbers = party.smsNumbers,
                smsNumber,
                partySMSNumber,
                phoneNumber,
                rawPhoneLabelObjectDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/phone_label_types"),
                rawPhoneLabelType,
                label,
                rawDataObjectsByTypeByOriginId = createTransactionOperation.rawDataObjectsByTypeByOriginId,
                rawDataObjectsByType,
                partyPhoneNumberCriteria,
                filteredPartyPhoneNumbers,
                filteredPartySMSNumbers,
                customerPreferenceRoleRanking,
                customerPreferenceSMSRoleRanking;

                if(!rawPhoneLabelObjectDescriptor) {
                    throw "rawPhoneLabelObjectDescriptor with moduleId: 'data/main.mod/model/phone_label_types'";
                }

                rawDataObjectsByType = rawDataObjectsByTypeByOriginId.get(rawPhoneLabelObjectDescriptor);
                if(!rawDataObjectsByType) {
                    console.warn("Missing raw Phone Label data: party.originId: "+ party.originId+", labelId: "+labelId+", countryCode: "+countryCode+", rawPhoneNumber: "+rawPhoneNumber+ ", originId: ",originId);
                } else {
                    rawPhoneLabelType = rawDataObjectsByType.get(labelId.toString());
                    if(rawPhoneLabelType) {
                        label = rawPhoneLabelType.type_label;
                    }
                }


            //Check if we have one
            if(partyPhoneNumbers && partyPhoneNumbers.length > 0) {

                if(label) {
                    partyPhoneNumberCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                        label: label,
                        originId: originId
                    });    
                } else {
                    partyPhoneNumberCriteria = new Criteria().initWithExpression("originId == $originId", {
                        originId: originId
                    });    
                }


                filteredPartyPhoneNumbers = partyPhoneNumbers.filter(partyPhoneNumberCriteria.predicateFunction);

                if(filteredPartyPhoneNumbers && filteredPartyPhoneNumbers.length) {
                    if(label && filteredPartyPhoneNumbers.length > 1) {
                        throw "More than one PartyPhoneNumber with label: '"+label+"' and originId: '"+originId+"'";
                    }
                    partyPhoneNumber = filteredPartyPhoneNumbers[0];
                    phoneNumber = partyPhoneNumber.messagingChannel;
                }
            } 

            if(!partyPhoneNumber) {
                partyPhoneNumber = mainService.createDataObject(PartyPhoneNumber);
                if(label) {
                    partyPhoneNumber.label = label;
                }
                partyPhoneNumber.originId = originId;

                //Capturing the original ranking a/b/c/d
                customerPreferenceRoleRanking = mainService.createDataObject(RoleRanking);
                customerPreferenceRoleRanking.role = this.customerPreferenceRole;
                customerPreferenceRoleRanking.ranking = customerPreferenceRanking;
                partyPhoneNumber.roleRankings = [customerPreferenceRoleRanking];

                /*
                    Take care of PartyPhoneNumber on a party
                */
                if(partyPhoneNumbers) {
                    partyPhoneNumbers.push(partyPhoneNumber);
                } else {
                    party.phoneNumbers = partyPhoneNumbers = [partyPhoneNumber];
                }
            }

            

            if(!phoneNumber) {
                phoneNumber = mainService.createDataObject(PhoneNumber);
                //Should match country.phoneCode
                phoneNumber.countryCode = countryCode;

                // partyPhoneNumber.label = rawData.type_label;
                //Seems to come as "phone" : "770-645-2488",
                phoneNumber.nationalNumber = rawPhoneNumber.split("-").join("");
                phoneNumber.originId = originId;

                partyPhoneNumber.messagingChannel = phoneNumber;
            } else if(phoneNumber.originId !== originId){
                phoneNumber.countryCode = countryCode;
                // partyPhoneNumber.label = rawData.type_label;
                //Seems to come as "phone" : "770-645-2488",
                phoneNumber.nationalNumber = rawPhoneNumber.split("-").join("");
                phoneNumber.originId = originId;
            }

            //Set capabilities:
            if(rawPhoneLabelType) {
                if(rawPhoneLabelType.permanent_label.indexOf("SMS") !== -1) {
                    phoneNumber.supportsTextMessage = true;
                    phoneNumber.isMobile = true;
                }
                if(rawPhoneLabelType.permanent_label.indexOf("Voicemail") !== -1) {
                    phoneNumber.supportsVoiceMessage = true;
                }
                if(rawPhoneLabelType.permanent_label.indexOf("Fax") !== -1) {
                    phoneNumber.supportsFax = true;
                }
    
                if((rawPhoneLabelType.permanent_label.indexOf("Mobile") !== -1) || (rawPhoneLabelType.permanent_label.indexOf("Cell") !== -1)) {
                    phoneNumber.supportsTextMessage = true;
                    phoneNumber.isMobile = true;
                }    
            }

            if(phoneNumber.supportsTextMessage) {
                //Check if we have one
                if(partySMSNumbers && partySMSNumbers.length > 0) {

                    partyPhoneNumberCriteria = new Criteria().initWithExpression("label == $label && originId == $originId", {
                        label: label,
                        originId: originId
                    });
                    filteredPartySMSNumbers = partySMSNumbers.filter(partyPhoneNumberCriteria.predicateFunction);

                    if(filteredPartySMSNumbers && filteredPartySMSNumbers.length) {
                        if(filteredPartySMSNumbers.length > 1) {
                            throw "More than one PartyPhoneNumber with label: '"+label+"' and originId: '"+originId+"'";
                        }
                        partySMSNumber = filteredPartySMSNumbers[0];
                        smsNumber = partySMSNumber.messagingChannel;
                    }
                } 

                if(!partySMSNumber) {
                    partySMSNumber = mainService.createDataObject(PartySMSNumber);
                    partySMSNumber.label = label;
                    partySMSNumber.originId = originId;

                    partySMSNumber.messagingChannel = phoneNumber;

                    //Capturing the original ranking a/b/c/d
                    customerPreferenceSMSRoleRanking = mainService.createDataObject(RoleRanking);
                    customerPreferenceSMSRoleRanking.role = this.customerPreferenceRole;
                    customerPreferenceSMSRoleRanking.ranking = customerPreferenceRanking;
                    partySMSNumber.roleRankings = [customerPreferenceSMSRoleRanking];

                    /*
                        Take care of PartyPhoneNumber on a party
                    */
                    if(partySMSNumbers) {
                        partySMSNumbers.push(partySMSNumber);
                    } else {
                        party.smsNumbers = partySMSNumbers = [partySMSNumber];
                    }
                }

            }

            


            if(rawDataCreationDate) {
                if(phoneNumber.creationDate.getTime() !== rawDataCreationDate.getTime()) {
                    phoneNumber.creationDate = rawDataCreationDate;
                    partyPhoneNumber.creationDate = rawDataCreationDate;
                }
            }
            if(rawDataModificationDate) {
                if(phoneNumber.modificationDate.getTime() !== rawDataModificationDate.getTime()) {
                    phoneNumber.modificationDate = rawDataModificationDate;
                    partyPhoneNumber.modificationDate = rawDataModificationDate;
                }
            }

        }
    },

    performStaffMembersMergeOperation: {
        value: function(mergeOperation) {
            //console.log("performStaffMembersMerge(): ",mergeOperation);

            var self = this,
                mainService = this.rootService,
                rawData = mergeOperation.data,
                referrerId = mergeOperation.referrerId,
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                originIdValue = this.originIdValueForOperation(mergeOperation),
                practice,
                organizationObjectDescriptor = mainService.objectDescriptorForType(Organization),
                roleObjectDescriptor = mainService.objectDescriptorForType(Role),
                role,
                rawStaffTypeDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/staff_types"),
                rawData_staff_type_id = (rawData.staff_type_id+STAFF_TYPE_ORIGIN_ID_RANGE_START),//We add 1000 to de-conflict wih other types that have interger primary keys
                phrontPersonObjectDescriptor = mainService.objectDescriptorForType(Person);

            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(Person),
                this._createObjectDescriptorStoreForTypeIfNeeded(Position),
                this._createObjectDescriptorStoreForTypeIfNeeded(EmploymentPosition),
                this._createObjectDescriptorStoreForTypeIfNeeded(EmploymentPositionStaffing),
                this._createObjectDescriptorStoreForTypeIfNeeded(Calendar)
            ])
            .then(function() {
    
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationObjectDescriptor, rawData.practice_id, createTransactionOperation);
            })
            .then(function(_practice){
                practice = _practice;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(roleObjectDescriptor, rawData_staff_type_id, createTransactionOperation, rawStaffTypeDescriptor);
            })
            .then(function(_role) {
                role = _role;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, originIdValue, createTransactionOperation, null, ["emailAddresses", "postalAddresses","phoneNumbers","employmentHistory"]);
            })
            .then(function(person) {
                if(!person) {
                    return self.createPerson(rawData, originIdValue, createTransactionOperation);
                } else {
                    // return mainService.getObjectProperties(result[0], "emailAddresses", "postalAddresses","phoneNumbers","employmentHistory")
                    // .then(function() {
                        return person;
                    //});
                }
            })
            .then(function(person) {
                var employmentHistory = person.employmentHistory,
                    position,
                    employmentPosition,
                    employmentPositionStaffing,
                    employmentPositionStaffingCalendar,
                    rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date),
                    rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);


                if(!employmentHistory || employmentHistory.length === 0) {
                    position = mainService.createDataObject(Position);
                    //Setup the position,
                    position.name = role.name; // Redundant :-(
                    position.role = role;
    
                    employmentPosition = mainService.createDataObject(EmploymentPosition);
                    employmentPositionStaffing = mainService.createDataObject(EmploymentPositionStaffing);
                    employmentPositionStaffingCalendar = mainService.createDataObject(Calendar);

                    employmentPosition.employer = practice;
                    employmentPosition.position = position;
    
                    //and positionEmploymentStaffing
                    //employmentPositionStaffing.employmentType = cdiEmploymentType; //We don't have that info
                    employmentPositionStaffing.employmentPosition = employmentPosition;
                    
                    employmentPositionStaffing.calendars = [employmentPositionStaffingCalendar];
                    //WARNING: check if we still need to also do:
                    if(!employmentPositionStaffingCalendar.owner || employmentPositionStaffingCalendar.owner !== employmentPositionStaffing) {
                        employmentPositionStaffingCalendar.owner = employmentPositionStaffing;
                    }
                    if(person.employmentHistory) {
                        person.employmentHistory.push(employmentPositionStaffing);
                    } else {
                        person.employmentHistory = [employmentPositionStaffing];
                    }
                    //Inverse:
                    if(employmentPositionStaffing.employee !== person) {
                        //employmentPositionStaffing.employee = doctor;
                        console.error("Inverse propagation error");
                    }

                }
                return person;
            });
        }
    },
    // createStaffMembers: {
    //     value: function(rawData, originIdValue, createTransactionOperation) {
    //         console.log("performLocationTypesMerge(): ",rawData);

    //         var mainService = this.rootService,
    //             practice,
    //             organizationObjectDescriptor = mainService.objectDescriptorForType(Organization),
    //             roleObjectDescriptor = mainService.objectDescriptorForType(Role),
    //             role;

    //         return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationObjectDescriptor, rawData.practice_id, createTransactionOperation)
    //         .then(function(_practice){
    //             practice = _practice;

    //             return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(roleObjectDescriptor, rawData.staff_type_id, createTransactionOperation);
    //         })
    //         .then(function(_role){
    
    //             role = _role;

    //             var position = mainService.createDataObject(Position),
    //                 employmentPosition = mainService.createDataObject(EmploymentPosition),
    //                 employmentPositionStaffing = mainService.createDataObject(EmploymentPositionStaffing),    
    //                 staffMember = mainService.createDataObject(Person),
    //                 staffMemberName = new PersonName(),
    //                 staffMemberCalendar = mainService.createDataObject(Calendar),
    //                 rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date)
    //                 rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);

    //             //Name
    //             staffMember.name = staffMemberName;
    //             staffMember.originId = rawData.person_id;
    //             staffMemberName.namePrefix = rawData.title;
    //             staffMemberName.givenName = rawData.first_name;
    //             staffMemberName.familyName = rawData.last_name;
    //             if(rawData.short_name) {
    //                 staffMemberName.nickname = rawData.short_name;
    //             }

    //             if(rawDataCreationDate) {
    //                 staffMember.creationDate = rawDataCreationDate;
    //             }
    //             if(rawDataModificationDate) {
    //                 service.modificationDate = rawDataModificationDate;
    //             }

    //             //Setup the position,
    //             position.name = role.name; // Redundant :-(
    //             position.role = role;

    //             //employmentPosition
    //             //employmentPosition.allowedEmploymentTypes = [cdiEmploymentType];
    //             employmentPosition.employer = practice;
    //             employmentPosition.position = position;

    //             //and positionEmploymentStaffing
    //             //employmentPositionStaffing.employmentType = cdiEmploymentType; //We don't have that info
    //             employmentPositionStaffing.employmentPosition = employmentPosition;
                
    //             employmentPositionStaffing.calendars = [staffMemberCalendar];
    //             //WARNING: check if we still need to also do:
    //             if(!staffMemberCalendar.owner || staffMemberCalendar.owner !== employmentPositionStaffing) {
    //                 staffMemberCalendar.owner = employmentPositionStaffing;
    //             }

    //             staffMember.employmentHistory = [employmentPositionStaffing];
    //             //Inverse:
    //             if(employmentPositionStaffing.employee !== staffMember) {
    //                 //employmentPositionStaffing.employee = doctor;
    //                 console.error("Inverse propagation error");
    //             }

    //             //Missing: Set the services a staff member can provide.

    //             return Promise.resolve(staffMember);

    //         });

    //     }
    // },
    // updateStaffMembers: {
    //     value: function(dataObject, rawData) {
    //         console.log("updateStaffMembers(): ",rawData);
    //         return Promise.resolve(dataObject);
    //     }
    // },
    // performPatientsMergeOperation: {
    //     value: function(mergeOperation) {
    //         console.log("handleStaffMembersMerge(): ",mergeOperation);

    //         var mainService = this.rootService,
    //             referrerId = mergeOperation.referrerId,
    //             createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),

    //             phrontObjectDescriptor = mainService.objectDescriptorForType(Person);

    //         return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontObjectDescriptor, rawData.person_id, createTransactionOperation)
    //         .then(function(result){
    //             if(!result || result.length === 0) {
    //                 return self.createPatients(data, originIdValue, createTransactionOperation);
    //             } else {
    //                 return self.updatePatiens(result[0],data, createTransactionOperation);
    //             }
    //         });
    //     }
    // },
    performAccountHoldersMergeOperation: {
        value: function(mergeOperation) {
            //console.log("performAccountHoldersMergeOperation(): ",mergeOperation);

            var self = this,
                mainService = this.rootService,
                rawData = mergeOperation.data,
                referrerId = mergeOperation.referrerId,
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                originIdValue = this.originIdValueForOperation(mergeOperation),
                practice,
                phrontPersonObjectDescriptor = mainService.objectDescriptorForType(Person),
                person;

            return this.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, originIdValue, createTransactionOperation)
            .then(function(person) {
                if(!person) {
                    return self.createPerson(rawData, originIdValue, createTransactionOperation);
                } else {
                    return mainService.getObjectProperties(person, "emailAddresses", "postalAddresses","phoneNumbers","employmentHistory")
                    .then(function() {
                        var rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date),
                            rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);
    
                        //Should we compare rawDataModificationDate to person.modificationDate to conditionally compare values? Or just go through properties one by one?
                        console.error("Implementation missing to update an existing account_holder");

                        return person;
                    });
                }
            });
        }
    },
    performPatientsMergeOperation: {
        value: function(mergeOperation) {
            //console.log("performPatientsMergeOperation(): ",mergeOperation);

            var self = this,
                mainService = this.rootService,
                rawData = mergeOperation.data,
                referrerId = mergeOperation.referrerId,
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                originIdValue = this.originIdValueForOperation(mergeOperation),
                practice,
                organizationObjectDescriptor = mainService.objectDescriptorForType(Organization),
                roleObjectDescriptor = mainService.objectDescriptorForType(Role),
                accountRelationshipRoleA,
                accountRelationshipRoleB,
                phrontPersonObjectDescriptor = mainService.objectDescriptorForType(Person),
                rawLanguageTypesDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/language_types"),
                rawAccountRelationshipTypesDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/account_relationship_types"),
                
                rawLanguageType,
                accountHolderPersonA,
                accountHolderPersonB,
                orthodontist,
                treatmentCoordinator,
                clinicalAssistant;

            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(Person),
                this._createObjectDescriptorStoreForTypeIfNeeded(PersonalRelationship),
                this._createObjectDescriptorStoreForTypeIfNeeded(B2CCustomerSupplierRelationship),
                this._createObjectDescriptorStoreForTypeIfNeeded(B2BCustomerSupplierRelationship),
                this._createObjectDescriptorStoreForTypeIfNeeded(B2CCustomerSupplierResponsibleParty),
                this._createObjectDescriptorStoreForTypeIfNeeded(RoleRanking)
            ])
            .then(function() {
    
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationObjectDescriptor, rawData.location_id, createTransactionOperation, null, ["b2cCustomerRelationships"]);
            })
            .then(function(_practice){
                practice = _practice;

                /* 
                    here we load a raw type operations, that we don't want to convert one-to-one to a phront type, so we pass null as the first argument.
                */
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.language_id, createTransactionOperation, rawLanguageTypesDescriptor);
            })
            .then(function(value) {
                var operationForRawLanguageType = self.operationForTypeOriginIdInCreateTransactionOperation(rawLanguageTypesDescriptor, rawData.language_id.toString(), createTransactionOperation);
                rawLanguageType  = operationForRawLanguageType && operationForRawLanguageType.data;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(roleObjectDescriptor, rawData.account_relationship_a_id.toString(), createTransactionOperation, rawAccountRelationshipTypesDescriptor);
            })
            .then(function(_accountRelationshipRoleA) {
                accountRelationshipRoleA = _accountRelationshipRoleA;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(roleObjectDescriptor, rawData.account_relationship_b_id.toString(), createTransactionOperation, rawAccountRelationshipTypesDescriptor);
            })
            .then(function(_accountRelationshipRoleB) {
                accountRelationshipRoleB = _accountRelationshipRoleB;
    
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.account_holder_a_id, createTransactionOperation);
            })
            .then(function(_accountHolderPersonA) {
                accountHolderPersonA = _accountHolderPersonA;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.account_holder_b_id, createTransactionOperation);
            })
            .then(function(_accountHolderPersonB) {
                accountHolderPersonB = _accountHolderPersonB;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.orthodontist_id, createTransactionOperation, null, ["employmentHistory"]);
            })
            .then(function(_orthodontist) {
                orthodontist = _orthodontist;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.treatment_coordinator_id, createTransactionOperation, null, ["employmentHistory"]);
            })
            .then(function(_treatmentCoordinator) {
                treatmentCoordinator = _treatmentCoordinator;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.clinical_assistant_id, createTransactionOperation, null, ["employmentHistory"]);
            })
            .then(function(_clinicalAssistant) {
                clinicalAssistant = _clinicalAssistant;

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, originIdValue, createTransactionOperation);
            })
            .then(function(person) {
                if(!person) {
                    return self.createPerson(rawData, originIdValue, createTransactionOperation);
                } else {
                    return mainService.getObjectProperties(person, "emailAddresses", "postalAddresses","phoneNumbers","employmentHistory","preferredLocales","firstPersonalRelationships")
                    .then(function() {
                        return person;
                    });
                }
            })
            .then(function(person) {
                var rawDataCreationDate = self.dateFromUnixTimestamp(rawData.created_date),
                    rawDataModificationDate = self.dateFromUnixTimestamp(rawData.last_modified_date);

                    
                //Set the locales from rawData.language_id
                if(rawLanguageType) {
                    var personPreferredLocales = person.preferredLocales;

                    if(!personPreferredLocales) {
                        person.preferredLocales = personPreferredLocales = [];
                    }

                    if(personPreferredLocales.indexOf(rawLanguageType.iso_language_code) === -1) {
                        personPreferredLocales.push(rawLanguageType.iso_language_code);
                    }
                }

                var firstPersonalRelationships = person.firstPersonalRelationships;

                /*
                    Now need to create the PersonalRelationship(s) between patient and accountHolderPersonA and accountHolderPersonB (which could be self).

                    !!! from our perspective, if there is no Self set, we assume that the account holder is NOT self

                    We have a relationship between the practice and the patient, so we don't need self.
                */

                if(accountHolderPersonA && accountHolderPersonA !== person && (!accountRelationshipRoleA || (accountRelationshipRoleA && accountRelationshipRoleA.name !== "Self"))) {
                    var relationshipWithAccountA;


                    if(firstPersonalRelationships && firstPersonalRelationships.length > 0) {

                        relationshipWithAccountACriteria = new Criteria().initWithExpression("secondPerson == $secondPerson", {
                            secondPerson: accountHolderPersonA
                        });
                        filteredFirstPersonalRelationships = firstPersonalRelationships.filter(relationshipWithAccountACriteria.predicateFunction);
    
                        if(filteredFirstPersonalRelationships && filteredFirstPersonalRelationships.length) {
                            if(filteredFirstPersonalRelationships.length > 1) {
                                throw "More than one relationshipWithAccountA with secondPerson: '"+JSON.stringify(accountHolderPersonA);
                            }
                            relationshipWithAccountA = filteredFirstPersonalRelationships[0];
                        }
                    } 
    

                    if(!relationshipWithAccountA) {
                        relationshipWithAccountA = mainService.createDataObject(PersonalRelationship);
                        relationshipWithAccountA.firstPerson = person;
    
                        /*
                            We don't know the reverse relationship of accountRelationshipRoleB that should be set on firstPersonRelationshipRole property
                        */
                        //relationshipWithAccountA.firstPersonRelationshipRole = ;
                        relationshipWithAccountA.secondPerson = accountHolderPersonA;
    
                        ///We may not have a role...
                        if(accountRelationshipRoleA) {
                            relationshipWithAccountA.secondPersonRelationshipRole = accountRelationshipRoleA;
                        }
    
                        if(rawDataCreationDate) {
                            relationshipWithAccountA.creationDate = rawDataCreationDate;
                        }
                        if(rawDataCreationDate) {
                            relationshipWithAccountA.modificationDate = rawDataModificationDate;
                        }    
                    }

                }

                if(accountHolderPersonB && accountHolderPersonB !== person && (!accountRelationshipRoleB || (accountRelationshipRoleB && accountRelationshipRoleB.name !== "Self"))) {
                    var relationshipWithAccountB;



                    if(firstPersonalRelationships && firstPersonalRelationships.length > 0) {

                        relationshipWithAccountACriteria = new Criteria().initWithExpression("secondPerson == $secondPerson", {
                            secondPerson: accountHolderPersonB
                        });
                        filteredFirstPersonalRelationships = firstPersonalRelationships.filter(relationshipWithAccountACriteria.predicateFunction);
    
                        if(filteredFirstPersonalRelationships && filteredFirstPersonalRelationships.length) {
                            if(filteredFirstPersonalRelationships.length > 1) {
                                throw "More than one relationshipWithAccountA with secondPerson: '"+JSON.stringify(accountHolderPersonB);
                            }
                            relationshipWithAccountB = filteredFirstPersonalRelationships[0];
                        }
                    } 

                    if(!relationshipWithAccountB) {

                        relationshipWithAccountB = mainService.createDataObject(PersonalRelationship);
                        relationshipWithAccountB.firstPerson = person;

                        /*
                            We don't know the reverse relationship of accountRelationshipRoleB that should be set on firstPersonRelationshipRole property
                        */
                        //relationshipWithAccountB.firstPersonRelationshipRole = ;
                        relationshipWithAccountB.secondPerson = accountHolderPersonB;

                        ///We may not have a role...
                        if(accountRelationshipRoleB) {
                            relationshipWithAccountB.secondPersonRelationshipRole = accountRelationshipRoleB;  
                        relationshipWithAccountB.secondPersonRelationshipRole = accountRelationshipRoleB;  
                            relationshipWithAccountB.secondPersonRelationshipRole = accountRelationshipRoleB;  
                        }

                        if(rawDataCreationDate) {
                            relationshipWithAccountB.creationDate = rawDataCreationDate;
                        }
                        if(rawDataCreationDate) {
                            relationshipWithAccountB.modificationDate = rawDataModificationDate;
                        }
                    }
                }


                /*
                    get or create the B2CCustomerSupplierRelationship between the practice and the patient 
                */
                var practicePatientRelationships = practice.b2cCustomerRelationships,
                    filteredPracticePatientRelationships,
                    practicePatientRelationship; //The one for this specific patient.
                
                if(practicePatientRelationships && practicePatientRelationships.length > 0) {
                    var patientCriteria = new Criteria().initWithExpression("customer == $customer", {
                        customer: person
                    });

                    filteredPracticePatientRelationships = practicePatientRelationships.filter(patientCriteria.predicateFunction);
    
                    if(filteredPracticePatientRelationships && filteredPracticePatientRelationships.length) {
                        if(filteredPracticePatientRelationships.length > 1) {
                            throw "More than one B2CCustomerSupplierRelationship for custommer: "+ person.name;
                        }
                        practicePatientRelationship = filteredPracticePatientRelationships[0];
                    }
                } 
                
                if(!practicePatientRelationship) {
                    //No existing relationship, we create one.

                    practicePatientRelationship = mainService.createDataObject(B2CCustomerSupplierRelationship);
                    practicePatientRelationship.supplier = practice;
                    practicePatientRelationship.customer = person;

                    if(rawDataCreationDate) {
                        practicePatientRelationship.creationDate = rawDataCreationDate;
                    }
                    if(rawDataCreationDate) {
                        practicePatientRelationship.modificationDate = rawDataModificationDate;
                    }

                    /*
                        entry_date:
                        - assume it's the begin of the relationship's existenceTimeRange
                        .existenceTimeRange = new Range(self.dateFromUnixTimestamp(rawData.entry_date), null);
                    */
                    practicePatientRelationship.existenceTimeRange = new Range(self.dateFromUnixTimestamp(rawData.entry_date), null);

                    /*
                        Create the calendar for the customer:
                    */
                    var customerCalendar = mainService.createDataObject(Calendar);
                    customerCalendar.name = person.name + " Calendar";
                    customerCalendar.description = "Calendar used for customer's appointments";
                    practicePatientRelationship.calendars = [customerCalendar];
                    //Check but this shouldn't be necessary
                    // if(!customerCalendar.owner || customerCalendar.owner !== practicePatientRelationship) {
                    //     customerCalendar.owner = practicePatientRelationship;
                    // }
    
                    /*
                        Set preferred phone numbers to use. We're going to use 
                        rawData.preferred_sms_phone_number
                    */

                    if(rawData.preferred_sms_phone_number && rawData.preferred_sms_phone_number !== "") {
                        var personResult,
                        accountHolderPersonAResult,
                        accountHolderPersonBResult,
                        preferredPartySMSPhoneNumber,
                        smsNumberCriteria = new Criteria().initWithExpression("smsNumbers.filter{messagingChannel.nationalNumber == $nationalNumber}", {
                            nationalNumber: rawData.preferred_sms_phone_number
                        });


                        /*
                            preferred_sms_owner tells us who preferred_sms_phone_number belongs to
                            If we don't have it, the order is:

                            account a, account b then patient
                        */
                        if(rawData.preferred_sms_owner) {

                            if(person.originId === rawData.preferred_sms_owner) {
                                personResult = smsNumberCriteria.evaluate(person);
                                if(personResult) {
                                    preferredPartySMSPhoneNumber = personResult[0];
                                }
                            } else if(accountHolderPersonA && accountHolderPersonA.originId === rawData.preferred_sms_owner){
                                accountHolderPersonAResult = smsNumberCriteria.evaluate(accountHolderPersonA);
                                if(accountHolderPersonAResult) {
                                    preferredPartySMSPhoneNumber = accountHolderPersonAResult[0];
                                }
                            } else if(accountHolderPersonB && accountHolderPersonB.originId === rawData.preferred_sms_owner){
                                accountHolderPersonBResult = smsNumberCriteria.evaluate(accountHolderPersonB);
                                if(accountHolderPersonBResult) {
                                    preferredPartySMSPhoneNumber = accountHolderPersonBResult[0];
                                }
                            }
                        } else {

                            personResult = smsNumberCriteria.evaluate(person);
                            if(accountHolderPersonA) {
                                accountHolderPersonAResult = smsNumberCriteria.evaluate(accountHolderPersonA);
                            }
                            if(accountHolderPersonB) {
                                accountHolderPersonBResult = smsNumberCriteria.evaluate(accountHolderPersonB);
                            }

                            if(accountHolderPersonAResult && accountHolderPersonAResult.length === 1 && accountHolderPersonAResult[0].messagingChannel.supportsTextMessage) {
                                preferredPartySMSPhoneNumber = accountHolderPersonAResult[0];
                            } else if(accountHolderPersonBResult && accountHolderPersonBResult.length === 1 && accountHolderPersonBResult[0].messagingChannel.supportsTextMessage) {
                                preferredPartySMSPhoneNumber = accountHolderPersonBResult[0];
                            } else if(personResult && personResult.length === 1  && personResult[0].messagingChannel.supportsTextMessage) {
                                preferredPartySMSPhoneNumber = personResult[0];
                            }
                        }

                        var practicePatientRelationshipPhoneNumbers = practicePatientRelationship.phoneNumbers,
                        existinPreferredPartySMSPhoneNumber;

                        //existinPreferredPartySMSPhoneNumbers = phoneNumberCriteria.evaluate(practicePatientRelationship);
                        existinPreferredPartySMSPhoneNumbers = practicePatientRelationship.smsNumbers;

                        /*
                            TODO: establish a new SMS dedicated channel that may points to the same phone number as one filed as PartyPhoneNumber
                        */

                        /*

                            #WARNING: It is possible that rawData.preferred_sms_phone_number points to a phone number that has been defined before but not as an SMS capable one. So we'll need to decide if rawData.preferred_sms_phone_number is a better source of truth and we set the number as SMS capable, and elect to use it here, or if we consider it an error at the rawData.preferred_sms_phone_number level.

                        */

                        if(preferredPartySMSPhoneNumber && (!existinPreferredPartySMSPhoneNumbers || existinPreferredPartySMSPhoneNumbers.length === 0)) {
                            //we couldn't find an exising one, we set it:
                            if(!practicePatientRelationshipPhoneNumbers) {
                                practicePatientRelationship.smsNumbers = practicePatientRelationshipPhoneNumbers = [];
                            }
                            practicePatientRelationshipPhoneNumbers.push(preferredPartySMSPhoneNumber);
                        }
                    }
                } else {
                    //console.log("We have a practicePatientRelationship");
                }


                /*
                *
                * Create the B2CCustomerSupplierResponsibleParty 
             * Create the B2CCustomerSupplierResponsibleParty 
                * Create the B2CCustomerSupplierResponsibleParty 
                * to put in practicePatientRelationship's responsiblePartyRelationships property
                * which will capture patient's account_holder_a_id and account_holder_b_id
                *
                */
                var practicePatientRelationshipsPromise;
                if(!mainService.isObjectCreated(practicePatientRelationship)) {
                    practicePatientRelationshipsPromise = mainService.getObjectProperties(practicePatientRelationship,["responsiblePartyRelationships","staffRelationships"]);
                } else {
                    practicePatientRelationshipsPromise = Promise.resolve(true);
                }

                return practicePatientRelationshipsPromise.then(function() {
                    var responsiblePartyRelationships = practicePatientRelationship.responsiblePartyRelationships,
                        responsiblePartyRelationshipA,
                        responsiblePartyRelationshipB;

                    if(accountHolderPersonA && accountHolderPersonB && (accountHolderPersonA === accountHolderPersonB)) {
                        console.warn("accountHolderPersonA and accountHolderPersonB are the same: ",accountHolderPersonA);
                    }

                    if(responsiblePartyRelationships && responsiblePartyRelationships.length > 0) {
                        var responsiblePartyACriteria = new Criteria().initWithExpression("responsibleParty == $responsibleParty && ", {
                            responsibleParty: accountHolderPersonA
                        });

                        filteredResponsiblePartyRelationships = responsiblePartyRelationships.filter(responsiblePartyACriteria.predicateFunction);

                        if(filteredResponsiblePartyRelationships && filteredResponsiblePartyRelationships.length) {
                            if(filteredResponsiblePartyRelationships.length > 1) {
                                throw "More than one B2CCustomerSupplierResponsibleParty for responsibleParty: "+accountHolderPersonA.name+", custommer: "+ person.name;
                            }
                            responsiblePartyRelationshipA = filteredResponsiblePartyRelationships[0];
                        }

                        //make sure the ranking match....

                        var responsiblePartyBCriteria = new Criteria().initWithExpression("responsibleParty == $responsibleParty", {
                            responsibleParty: accountHolderPersonB
                        });

                        filteredResponsiblePartyRelationships = responsiblePartyRelationships.filter(responsiblePartyBCriteria.predicateFunction);

                        if(filteredResponsiblePartyRelationships && filteredResponsiblePartyRelationships.length) {
                            if(filteredResponsiblePartyRelationships.length > 1) {
                                throw "More than one B2CCustomerSupplierResponsibleParty for responsibleParty: "+accountHolderPersonA.name+", custommer: "+ person.name;
                            }
                            responsiblePartyRelationshipB = filteredResponsiblePartyRelationships[0];
                        }

                    }

                    if(!responsiblePartyRelationships) {
                        practicePatientRelationship.responsiblePartyRelationships = responsiblePartyRelationships = [];
                    }

                    if(!responsiblePartyRelationshipA && accountHolderPersonA) {

                        responsiblePartyRelationshipA = mainService.createDataObject(B2CCustomerSupplierResponsibleParty);
                        responsiblePartyRelationshipA.b2cCustomerSupplierRelationship = practicePatientRelationship;
                        responsiblePartyRelationshipA.responsibleParty = accountHolderPersonA;
                        
                        var financialResponsibilityRoleRankingA = mainService.createDataObject(RoleRanking);
                        financialResponsibilityRoleRankingA.role = self.financialResponsibilityRole;
                        financialResponsibilityRoleRankingA.ranking = 1;
                        responsiblePartyRelationshipA.roleRankings = [financialResponsibilityRoleRankingA];

                        //responsiblePartyRelationships.push(responsiblePartyRelationshipA);

                    }

                    if(!responsiblePartyRelationshipB && accountHolderPersonB) {
                        responsiblePartyRelationshipB = mainService.createDataObject(B2CCustomerSupplierResponsibleParty);
                        responsiblePartyRelationshipB.b2cCustomerSupplierRelationship = practicePatientRelationship;
                        responsiblePartyRelationshipB.responsibleParty = accountHolderPersonB;
                        
                        var financialResponsibilityRoleRankingB = mainService.createDataObject(RoleRanking);
                        financialResponsibilityRoleRankingB.role = self.financialResponsibilityRole;
                        financialResponsibilityRoleRankingB.ranking = 2;
                        responsiblePartyRelationshipB.roleRankings = [financialResponsibilityRoleRankingB];

                        //responsiblePartyRelationships.push(responsiblePartyRelationshipB);
                    }



                    /*
                        process customer messaging channel preferences:

                        wants_phone_reminders_flag      BOOLEAN
                        wants_email_reminders_flag      BOOLEAN
                        wants_sms_reminders_flag        BOOLEAN

                        these are preferences specifically for appointments and therefore services, is it universal? Now kinda is when one has to signup to get into a store....

                        Also we don't have a specific sub structure to store other things like that so we'll refine later.
                    */
                    if(practicePatientRelationship) {
                        if(typeof rawData.wants_phone_reminders_flag === "boolean") {
                            practicePatientRelationship.customerWantsPhoneReminders = rawData.wants_phone_reminders_flag;
                        }
                        if(typeof rawData.wants_email_reminders_flag === "boolean") {
                            practicePatientRelationship.customerWantsEmailReminders = rawData.wants_email_reminders_flag;
                        } 
                        if(typeof rawData.wants_sms_reminders_flag === "boolean") {
                            practicePatientRelationship.customerWantsSMSReminders = rawData.wants_sms_reminders_flag;
                        } 
                    }
    


                    /*
                        Create the relationship between the patient and the practice's EmploymentPositionStaffing objects corresponding to the orthodontist, treatmentCoordinator and clinicalAssistant, which alreay have these roles via the their employmentPosition.positon.role
                    */
                    if(orthodontist || treatmentCoordinator || clinicalAssistant) {

                        var staffRelationships = practicePatientRelationship.staffRelationships,
                            /*
                                We know there's only one for that person for now. To be more robust we should fileter by existenceTimeRange and employmentPosition.employer to match the practice, in case the person worked for multiple practices, which happens.
                            */
                            orthodontistEmploymentPositionStaffing = orthodontist && orthodontist.employmentHistory ? orthodontist.employmentHistory[0] : null,
                            treatmentCoordinatorEmploymentPositionStaffing = treatmentCoordinator && treatmentCoordinator.employmentHistory ? treatmentCoordinator.employmentHistory[0] : null,
                            clinicalAssistantEmploymentPositionStaffing = clinicalAssistant && clinicalAssistant.employmentHistory ? clinicalAssistant.employmentHistory[0] : null;

                        if(staffRelationships && staffRelationships.length > 0) {
                            var filteredStaffRelationships;

                            if(orthodontist) {
                                var orthodontistCriteria = new Criteria().initWithExpression("employee == $employee", {
                                    employee: orthodontist
                                });
                                
                                filteredStaffRelationships = staffRelationships.filter(orthodontistCriteria.predicateFunction);
                
                                if(filteredStaffRelationships && filteredStaffRelationships.length) {
                                    if(filteredStaffRelationships.length > 1) {
                                        throw "More than one EmploymentPositionStaffing for orthodontist: "+ orthodontist.name;
                                    }
                                    //no need to re-set the variable
                                    // orthodontistEmploymentPositionStaffing = filteredStaffRelationships[0];
                                } else if(orthodontistEmploymentPositionStaffing) {
                                    staffRelationships.push(orthodontistEmploymentPositionStaffing);
                                }
                            }

                            if(treatmentCoordinator) {
                                var treatmentCoordinatorCriteria = new Criteria().initWithExpression("employee == $employee", {
                                    employee: treatmentCoordinator
                                });
                                
                                filteredStaffRelationships = staffRelationships.filter(treatmentCoordinatorCriteria.predicateFunction);
                
                                if(filteredStaffRelationships && filteredStaffRelationships.length) {
                                    if(filteredStaffRelationships.length > 1) {
                                        throw "More than one EmploymentPositionStaffing for orthodontist: "+ orthodontist.name;
                                    }
                                    //no need to re-set the variable
                                    // orthodontistEmploymentPositionStaffing = filteredStaffRelationships[0];
                                } else if(treatmentCoordinatorEmploymentPositionStaffing) {
                                    staffRelationships.push(treatmentCoordinatorEmploymentPositionStaffing);
                                }
                            }

                            if(clinicalAssistant) {
                                var clinicalAssistantCriteria = new Criteria().initWithExpression("employee == $employee", {
                                    employee: clinicalAssistant
                                });
                                
                                filteredStaffRelationships = staffRelationships.filter(clinicalAssistantCriteria.predicateFunction);
                
                                if(filteredStaffRelationships && filteredStaffRelationships.length) {
                                    if(filteredStaffRelationships.length > 1) {
                                        throw "More than one EmploymentPositionStaffing for orthodontist: "+ orthodontist.name;
                                    }
                                    //no need to re-set the variable
                                    // orthodontistEmploymentPositionStaffing = filteredStaffRelationships[0];
                                } else if(clinicalAssistantEmploymentPositionStaffing) {
                                    staffRelationships.push(clinicalAssistantEmploymentPositionStaffing);
                                }
                            }

                        } else {

                            if(!practicePatientRelationship.staffRelationships) {
                                practicePatientRelationship.staffRelationships = staffRelationships = [];
                            }
                            
                            if(orthodontistEmploymentPositionStaffing) {
                                staffRelationships.push(orthodontistEmploymentPositionStaffing);
                            }
                            if(treatmentCoordinatorEmploymentPositionStaffing) {
                                staffRelationships.push(treatmentCoordinatorEmploymentPositionStaffing);
                            }
                            if(clinicalAssistantEmploymentPositionStaffing) {
                                staffRelationships.push(clinicalAssistantEmploymentPositionStaffing);
                            }
                        }

                    }
                
                    return person;

                });

            });
        }
    },
    updatePatients: {
        value: function(dataObject, rawData) {
        }
    },

    performAppointmentsMergeOperation: {
        value: function(mergeOperation) {

            var self = this,
                mainService = this.rootService,
                rawData = mergeOperation.data,
                referrerId = mergeOperation.referrerId,
                createTransactionOperation  = this._pendingCreateTransactionOperationById.get(referrerId),
                originIdValue = this.originIdValueForOperation(mergeOperation),
                practice,
                organizationObjectDescriptor = mainService.objectDescriptorForType(Organization),
                practicePostalAddress,
                partyPostalAddressObjectDescriptor = mainService.objectDescriptorForType(PartyPostalAddress),
                procedureService,
                serviceObjectDescriptor = mainService.objectDescriptorForType(Service),
                roleObjectDescriptor = mainService.objectDescriptorForType(Role),
                serviceEngagementObjectDescriptor = mainService.objectDescriptorForType(ServiceEngagement),
                eventObjectDescriptor = mainService.objectDescriptorForType(Event),
                serviceEngagement,
                phrontPersonObjectDescriptor = mainService.objectDescriptorForType(Person),
                orthodontist,
                orthodontistEvent,
                patient,
                patientEvent,
                rawAppointmentStatus,
                rawAppointmentStatusDescriptor = mainService.objectDescriptorWithModuleId("data/main.mod/model/appointment_status_types");

                /*
                    Phront:

                    Organization -calendars -> Calendar -serviceEngagements (events->serviceEngagement)
                                - services -> Service -> service

                */

            //console.log("performAppointmentsMergeOperation() for originId["+originIdValue+"]: ",mergeOperation);


            return Promise.all([
                this._createObjectDescriptorStoreForTypeIfNeeded(ServiceEngagement),
                this._createObjectDescriptorStoreForTypeIfNeeded(Event)
            ])
            .then(function() {
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(organizationObjectDescriptor, rawData.location_id, createTransactionOperation, null, ["postalAddresses"]);
            })
            .then(function(_practice) {
                practice = _practice;

                if(!practice) {
                    throw `performAppointmentsMergeOperation Error:, no practice found for rawData: ${JSON.stringify(rawData)}`;
                }

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(serviceObjectDescriptor, rawData.procedure_id, createTransactionOperation,null,["variants"]);
            })
            .then(function(_procedureService) {
                procedureService = _procedureService;

                if(!procedureService) {
                    throw `performAppointmentsMergeOperation Error:, no procedureService found for rawData: ${JSON.stringify(rawData)}`;
                }

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.orthodontist_id, createTransactionOperation, null, ["employmentHistory"]);
            })
            .then(function(_orthodontist) {
                orthodontist = _orthodontist;

                if(!orthodontist) {
                    throw `performAppointmentsMergeOperation Error:, no orthodentist found for rawData: ${JSON.stringify(rawData)}`;
                }

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(phrontPersonObjectDescriptor, rawData.patient_id, createTransactionOperation);
            })
            .then(function(_patient) {
                patient = _patient;

                if(!patient) {
                    throw `performAppointmentsMergeOperation Error:, no patient found for rawData: ${JSON.stringify(rawData)}`;
                }

                return mainService.getObjectProperties(patient,"supplierRelationships");
            })
            .then(function() {
                if(!patient.supplierRelationships) {
                    throw `supplierRelationships Error:, no patient.supplierRelationships found for rawData: ${JSON.stringify(rawData)}`;
                }
                return mainService.getObjectsProperties(patient.supplierRelationships,"calendars");
            })
            .then(function() {
                /* 
                    here we load a raw type operations, that we don't want to convert one-to-one to a phront type, so we pass null as the first argument.
                */
                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(null, rawData.appointment_status_id, createTransactionOperation, rawAppointmentStatusDescriptor);
            })
            .then(function(value) {
                if(rawData.appointment_status_id > 0) {
                    rawAppointmentStatus = self.operationForTypeOriginIdInCreateTransactionOperation(rawAppointmentStatusDescriptor, rawData.appointment_status_id.toString(), createTransactionOperation).data;
                }

                return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(serviceEngagementObjectDescriptor, originIdValue, createTransactionOperation);
            })
            .then(function(_serviceEngagement) {
                serviceEngagement = _serviceEngagement;

                if(!procedureService) {
                    console.log("Missing procedure_id, did not import Appointment data: ",rawData);
                    return null;
                }

                var eventsPrommise,
                    rawAppointmentTimeRangeBegin = self.dateFromUnixTimestamp(rawData.appointment_time),
                rawAppointmentTimeRangeEnd = rawAppointmentTimeRangeBegin.dateByAdjustingComponentValues(0, 0, 0, 0, 0, rawData.duration),
                rawAppointmentTimeRange = new Range(rawAppointmentTimeRangeBegin,rawAppointmentTimeRangeEnd);

                if(!serviceEngagement) {
                    serviceEngagement = mainService.createDataObject(ServiceEngagement);
                    serviceEngagement.originId = originIdValue;

                    var practiceLocation = practice.postalAddresses && practice.postalAddresses[0];


                    /*
                        We have a single servicevariant per service for now
                    */
                    serviceEngagement.serviceVariant = procedureService.variants[0];

                    //Now we create the Doctor's event:
                    orthodontistEvent = mainService.createDataObject(Event);
                    //Carry the original appointment UUID as originId
                    orthodontistEvent.originId = originIdValue;
                    orthodontistEvent.participatingParty = orthodontist;
                    orthodontistEvent.calendar = orthodontist.employmentHistory[0].calendars[0];
                    orthodontistEvent.scheduledTimeRange = rawAppointmentTimeRange;

                    if(practiceLocation) {
                        orthodontistEvent.location = practiceLocation;
                    }

                    //Let's verify that participation is the default orthodontistEvent.participationEmum.Required
                    //console.log("orthodontistEvent.participation === Event.participationEmum.Required is ", orthodontistEvent.participation === Event.participationEmum.Required);
                    orthodontistEvent.participation = Event.participationEmum.Required;
                    orthodontistEvent.participationRoles = [self.eventOrganizerRole];
                    orthodontistEvent.participationStatus = Event.participationStatusEmum.Accepted;
                    orthodontistEvent.participationStatusLog = new Map();
                    orthodontistEvent.participationStatusLog.set(Event.participationStatusEmum.Accepted, undefined);

                    //Set the Organizer's event as the one on the serviceEngagement:
                    serviceEngagement.event = orthodontistEvent;

                    //Now we create the Patient's event:
                    patientEvent = mainService.createDataObject(Event);
                    //Carry the original appointment UUID as originId
                    patientEvent.originId = originIdValue;
                    patientEvent.scheduledTimeRange = rawAppointmentTimeRange;

                    if(practiceLocation) {
                        patientEvent.location = practiceLocation;
                    }

                    //Now we link the Patient's event to the doctor's which is the root/organizer one:
                    patientEvent.parent = orthodontistEvent;
                    patientEvent.participatingParty = patient;
                    patientEvent.calendar = patient.supplierRelationships[0].calendars[0];

                    patientEvent.participation = Event.participationEmum.Required;
                    patientEvent.participationRoles = [
                        self.eventAttendeeRole,
                        self.patientRole
                    ];
                    patientEvent.participationStatus = Event.participationStatusEmum.Accepted;
                    patientEvent.participationStatusLog = new Map();
                    patientEvent.participationStatusLog.set(Event.participationStatusEmum.Accepted, undefined);

                    //processing rawAppointmentStatus's value if we have on:

                    eventsPromise = Promise.resolve([orthodontistEvent, patientEvent]);




                } else {
                    // console.log("Missing logic to update ServiceEngagement for appointment raw data:",rawData);
        
                    eventsPromise = mainService.getObjectProperties(serviceEngagement,"event")
                    .then(() => {
                        orthodontistEvent = serviceEngagement.event;
                        return mainService.getObjectProperties(orthodontistEvent,"children", "rescheduledEvent", "participationStatus", "participationStatusLog");
                    })
                    .then(() => {
                        patientEvent = orthodontistEvent.children
                            ? orthodontistEvent.children[0]
                            : null;
                        var localPromise;
                        if(patientEvent) {
                            localPromise =  mainService.getObjectProperties(patientEvent, "rescheduledEvent", "participationStatus", "participationStatusLog");
                        } else {
                            console.log("performAppointmentsMergeOperation() for originId["+originIdValue+"]: ERROR - No patient event found");

                            localPromise = Promise.resolve(null)
                        }
                        orthodontistEvent = serviceEngagement.event;
                        return localPromise.then(() => {
                            return [orthodontistEvent, patientEvent];
                        });
                    });
                }


                //Now handle linked_appointment_id -> rescheduledAppointment
                if(rawData.linked_appointment_id) {

                    //console.log("performAppointmentsMergeOperation() for originId["+originIdValue+"]: linked_appointment_id:",rawData.linked_appointment_id);

                    eventsPromise = eventsPromise.then(function(events) {
                        var parentCriteria = new Criteria().initWithExpression("parent == null");
        
                        /*
                            We registerCreateTransactionDataObject for the orthodontistEvent, so once we get it we need to get the children
                        */
                        return self.phrontDataObjectWithDescriptorAndOriginIdInTransaction(eventObjectDescriptor, rawData.linked_appointment_id, createTransactionOperation, undefined, ["children"], parentCriteria)
                        .then(function(rescheduledOrthodontistEvent) {

                            if(rescheduledOrthodontistEvent) {
                                if(rescheduledOrthodontistEvent.children === undefined) {
                                    return mainService.getObjectProperties(rescheduledOrthodontistEvent,"children")
                                    .then(() => { 
                                        return rescheduledOrthodontistEvent;
                                    });
                                } else {
                                    return rescheduledOrthodontistEvent;
                                }
                            } else {
                                console.warn("Could't find rescheduled orthodontist event for linked_appointment_id '"+rawData.linked_appointment_id+"'");
                                return null;
                            }
                        })
                        .then(function(rescheduledOrthodontistEvent) {
                            if(rescheduledOrthodontistEvent) {
                                var rescheduledPatientEvent = rescheduledOrthodontistEvent.children[0];
                                if(!rescheduledPatientEvent) {
                                    console.error("Could't find rescheduled patient event for linked_appointment_id '"+rawData.linked_appointment_id+"'");
                                    return Promise.reject(new Error("Could't find rescheduled patient event for linked_appointment_id '"+rawData.linked_appointment_id+"'"));
                                }
    
    
                                /*
                                    We have both now:
                                */
                               if(!patientEvent.rescheduledEvent || patientEvent.rescheduledEvent != rescheduledPatientEvent) {
                                    patientEvent.rescheduledEvent = rescheduledPatientEvent;
                               }
                               if(!orthodontistEvent.rescheduledEvent || orthodontistEvent.rescheduledEvent != rescheduledOrthodontistEvent) {
                                    orthodontistEvent.rescheduledEvent = rescheduledOrthodontistEvent;
                               }
                            }

                            //We just need the promise to complete, the next step doesn't expect the result from it.
                            return;
                        });

                    });
                } else {
                    eventsPromise.then(function(events) {
                        if(orthodontistEvent.rescheduledEvent || patientEvent.rescheduledEvent) {
                            console.log("setting existing rescheduledEvent to null");
                            //We had one, but it's now null, so acting on it:
                            orthodontistEvent.rescheduledEvent = null;
                            patientEvent.rescheduledEvent = null;
                        }
                    });
                }



                return eventsPromise
                .then(function(events) {
                    if(rawAppointmentStatus) {
                        if(rawAppointmentStatus.permanent_label === "Missed") {
                            if(patientEvent.participationStatus !== Event.participationStatusEmum.Missed || !patientEvent.participationStatusLog || (patientEvent.participationStatusLog && !patientEvent.participationStatusLog.has(Event.participationStatusEmum.Missed) || patientEvent.participationStatusLog.get(Event.participationStatusEmum.Missed) === undefined)) {
                                patientEvent.participationStatus = Event.participationStatusEmum.Missed;
                                (patientEvent.participationStatusLog || (patientEvent.participationStatusLog = new Map())).set(Event.participationStatusEmum.Missed, null);    
                            }
                        } else if(rawAppointmentStatus.permanent_label === "Canceled by Practice") {
                            if(orthodontistEvent.participationStatus !== Event.participationStatusEmum.Canceled || !orthodontistEvent.participationStatusLog || (orthodontistEvent.participationStatusLog && !orthodontistEvent.participationStatusLog.has(Event.participationStatusEmum.Canceled))) {
                                orthodontistEvent.participationStatus = Event.participationStatusEmum.Canceled;
                                (orthodontistEvent.participationStatusLog || (orthodontistEvent.participationStatusLog = new Map())).set(Event.participationStatusEmum.Canceled, undefined);
                            }
                        } else if(rawAppointmentStatus.permanent_label === "Canceled by Patient") {
                            if(patientEvent.participationStatus !== Event.participationStatusEmum.Canceled || !patientEvent.participationStatusLog || (patientEvent.participationStatusLog && !patientEvent.participationStatusLog.has(Event.participationStatusEmum.Canceled))) {

                                patientEvent.participationStatus = Event.participationStatusEmum.Canceled;
                                (patientEvent.participationStatusLog || (patientEvent.participationStatusLog = new Map())).set(Event.participationStatusEmum.Canceled, undefined);
                            }
                        }
                        /*
                        Still needs to review what to do with rawAppointmentStatus:
                             - Pending
                             - Completed
                             - Rescheduled by Practice
                             - Rescheduled by Patient
                        */
                        else if(rawAppointmentStatus.permanent_label === "Rescheduled by Patient") {
                            //console.log("performAppointmentsMergeOperation() for originId["+originIdValue+"]: 'Rescheduled by Patient'");

                            patientEvent.participationStatus = Event.participationStatusEmum.Rescheduled;
                            (patientEvent.participationStatusLog || (patientEvent.participationStatusLog = new Map())).set(Event.participationStatusEmum.Rescheduled, undefined);
        
                        } else if(rawAppointmentStatus.permanent_label === "Rescheduled by Practice") {
                            //console.log("performAppointmentsMergeOperation() for originId["+originIdValue+"]: 'Rescheduled by Practice'");

                            orthodontistEvent.participationStatus = Event.participationStatusEmum.Rescheduled;
                            (orthodontistEvent.participationStatusLog || (orthodontistEvent.participationStatusLog = new Map())).set(Event.participationStatusEmum.Rescheduled, undefined);
                        }    

                    }

                    /*
                        Now that we're done, we register the orthodontistEvent so it can be find when another event might point to it looking for it's rescheduledEvent.
                    */
                    self.registerCreateTransactionDataObject(createTransactionOperation, orthodontistEvent);

                    return serviceEngagement;
                });

            })
            .catch((error) => {
                console.error("performAppointmentsMergeOperation() Error: ", error,mergeOperation);
                return  Promise.reject(error);
            });



        }
    },

    dateFromUnixTimestamp: {
        value: function(unixTimestamp) {
            return unixTimestamp ? new Date(Math.round(unixTimestamp*1000)) : null;
        }
    }


});