const validator = require('./luisValidator')
const luConverter = require('./luConverter')
const helpers = require('./../utils/helpers')

class Luis {
    constructor(LuisJSON = null){
        if (LuisJSON) {
            initialize(this, LuisJSON)
        } else {
            this.intents = [];
            this.entities = [];
            this.composites = [];
            this.closedLists = [];
            this.regex_entities = [];
            this.model_features = [];
            this.regex_features = [];
            this.utterances = [];
            this.patterns = [];
            this.patternAnyEntities = [];
            this.prebuiltEntities = [];
            // fix for #255
            this.luis_schema_version = "3.2.0";
            this.versionId = "0.1";
            this.name = "";
            this.desc = "";
            this.culture = "en-us";
        }
    }

    parseToLuContent(){
        helpers.checkAndUpdateVersion(this)
        return luConverter(this)
    }



    validate() {
        return validator(this)
    }
}

module.exports = Luis

const initialize = function(instance, LuisJSON) {
    for (let prop in LuisJSON) {
        instance[prop] = LuisJSON[prop];
    }   
}
