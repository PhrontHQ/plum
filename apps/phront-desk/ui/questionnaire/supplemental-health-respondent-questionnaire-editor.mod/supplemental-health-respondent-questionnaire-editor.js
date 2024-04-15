
var Promise = require("montage/core/promise").Promise,
    DataEditor = require("montage/ui/data-editor").DataEditor,
    Criteria = require("montage/core/criteria").Criteria,
    DataQuery = require("montage/data/model/data-query").DataQuery,
    Questionnaire = require("phront/data/main.mod/model/questionnaire/questionnaire").Questionnaire,
    Answer = require("phront/data/main.mod/model/questionnaire/answer").Answer,
    RespondentQuestionnaire = require("phront/data/main.mod/model/questionnaire/respondent-questionnaire").RespondentQuestionnaire,
    RespondentQuestionnaireVariableValue = require("phront/data/main.mod/model/questionnaire/respondent-questionnaire-variable-value").RespondentQuestionnaireVariableValue,
    RespondentQuestionnaireAnswer = require("phront/data/main.mod/model/questionnaire/respondent-questionnaire-answer").RespondentQuestionnaireAnswer,
    Asset = require("phront/data/main.mod/model/asset").Asset,
    currentEnvironment = require("montage/core/environment").currentEnvironment;

exports.SupplementalHealthRespondentQuestionnaireEditor = DataEditor.specialize({

    constructor: {
        value: function SupplementalHealthRespondentQuestionnaireEditor() {
            this.super();       
            return this;     
        }
    }

});
