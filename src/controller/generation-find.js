'use strict';

const _ = require('lodash');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const GenericFind = require('./generic-find');

/**
* GenerationFind does all the functionality of Generation.find
* To manually execute a "GenerationFind-find", call GenerationFind.find().
* To understand how finds work generally internally, See
* src/controller/generic-find (we extend that class).
* If you want to know how to use the Generation.find() API, See
* src/models/generation #find().
* @private
* @extends GenericFind
 */
class GenerationFind extends GenericFind {
  /**
   * We need to join families table, so that we can for example also find
   * generations based on their family name.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereJoin(context, criteria) {
    // Joins families, and because of the true flag also generation_parents.
    QueryUtils.joinRelatedGenerations(context.queryWhere, true);
  }

  /**
   * Build the returnObject. We want to have all family fields
   * (like familyName, familyId) inreturnObject.families and all
   * generation fields in returnObject.generations.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {
    returnObject.families = {};
    returnObject.generations = {};

    _.each(context.rowsWhere, function(row) {
      Utils.addGenerationFromRowToReturnObject(row, returnObject, criteria, true);
      Utils.addFamilyFromRowToReturnObject(row, returnObject, criteria);
    });

    // We could use Utils.deleteEmptyProperties() but this is maybe more performant.
    if(_.isEmpty(returnObject.families)) delete returnObject.families;
  }
}

GenerationFind.TABLE = CONSTANTS.TABLE_GENERATIONS

GenerationFind.ID_ALIAS = CONSTANTS.ID_ALIAS_GENERATION;

GenerationFind.SEARCHABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENERATION;

GenerationFind.COUNT = 'DISTINCT ' + CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ID_ALIAS_GENERATION;

GenerationFind.DEFAULT_FIELDS = ['generations.generationId', 'families.familyId'];

GenerationFind.GROUP_BY = CONSTANTS.TABLE_GENERATIONS + '.' + CONSTANTS.ID_ALIAS_GENERATION;

GenerationFind.ALIASES_TO_FIELD_WITHOUT_ID = _.merge(
  {},
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_FAMILY,
  CONSTANTS.ALIASES_TO_FIELD_WITHOUT_ID_GENERATION
);

module.exports = GenerationFind;
