'use strict';

const BaseModel = require('./base');

class TemplateTagModel extends BaseModel {
    /**
     * Construct a TemplateTagModel object
     * @method constructor
     * @param  {Object}    config
     * @param  {Object}    config.datastore         Object that will perform operations on the datastore
     */
    constructor(config) {
        super('templateTag', config);
    }

}

module.exports = TemplateTagModel;
