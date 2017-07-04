'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const CONSTANTS = require('../constants');
const logger = require('../logger');
const Utils = require('../utils');

/**
 * Generic find class which is the skeleton for all *find methods
 * (eg. Plant.find, Genotype.find...). This class holds a lot of default behaviour
 * and can get modified to achieve the wanted find behaviour.
 * The only function which should get called from outside is the #find()
 * function. The #find() function calls all the different methods this class
 * holds in in series. To change the behaviour of your find, extend this class
 * and overwrite the best matching method. See method comments for further and
 * more detailed information.
 */
class GenericFind {
  /**
   * This method takes care of the execution of the whole find process.
   * Your api calls this function.
   * @async
   * @param  {object}  [criteria={}]
   *         Criterias for find
   * @param  {string[]} [criteria.fields]
   *         Specify the fields to query and return.
   *         Eg: [familyName, generationName]
   * @param  {object} [criteria.where]
   *         Object which contains
   * @param  {integer} [criteria.offset]
   *         Skip the first x results
   * @param  {integer} [criteria.limit]
   *         limit to x results
   * @throws {Error}
   *         Only throws errors if something unexpected happens with sqlite.
   * @return {Object}
   *         returnObject which by default only contains how many entries where
   *         found (count) and how many are left (remaining). You can modify the
   *         content by overwriting #buildReturnObjectWhere() method.
   *         A returnObject should look like this:
   *         {
   *           count: 42,
   *           remaining: 13,
   *           families: {
   *             1: {
   *               familyId: 1,
   *               familyName: 'TestFamily'
   *             },
   *             2: {
   *               familyId: 2,
   *               familyName: 'TestFamily2'
   *             }
   *           },
   *           generations: {
   *             1: {
   *               generationId: 1,
   *               generationName: 'F1',
   *               familyId: 1
   *             },
   *             2: {
   *               generationId: 2,,
   *               generationName: 'S1',
   *               familyId: 2
   *             }
   *           }
   *         }
   */
  static async find(criteria) {
    if(_.isNil(criteria)) criteria = {};
    logger.debug(this.name, ' #find() criteria:', criteria);
    let context = {};
    context.fields = criteria.fields || false;

    this.initQuery(context, criteria);
    this.setQueryJoin(context, criteria);
    this.setQueryWhere(context, criteria);
    this.cloneQueryWhereIntoQueryCount(context, criteria);
    this.setQueryWhereDefaultFields(context, criteria);
    this.setQueryWhereAdditionalFields(context, criteria);
    this.setQueryCountFields(context, criteria);
    this.setQueryLimitAndOffset(context, criteria);
    this.setQueryGroup(context, criteria);
    this.stringifyQuery(context, criteria);

    await this.executeQuery(context, criteria);

    let returnObject = {};
    this.buildReturnObjectWhere(returnObject, context, criteria);
    this.buildReturnObjectCount(returnObject, context, criteria);

    logger.debug(this.name, '#find() returnObject:', returnObject);
    return returnObject;

  }

  /**
   * Init queries. Basically defines two properties in context
   * for queryWhere and queryCount. Besides that it sets
   * queryWhere to a select() and table to this.TABLE.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static initQuery(context, criteria) {
    // Init queries, we need two query objects, because we need a subquery which
    // counts the total rows we could find for this query. Basically the counting
    // query ignores the limit part and uses the COUNT() function in sqlite.
    // To make it easier we first set everything which is the same for both queries
    // to queryWhere and clone it into queryCount. So we have to do things only once.
    context.queryWhere = squel.select().from(this.TABLE, this.TABLE);
    context.queryCount;
  }

  /**
   * In case you have to join some tables, overwrite this function and
   * apply joins to context.queryWhere.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryJoin(context, criteria) {

  }

  /**
   * This method just applies Utils.setWhere to the context.queryWhere query.
   * Normally you shouldn't overwrite this, you can use this.SEARCHABLE_ALIASES to
   * adjust the behaviour.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhere(context, criteria) {
    Utils.setWhere(context.queryWhere, this.SEARCHABLE_ALIASES, criteria);
  }

  /**
   * Clones queryWhere into queryCount. So everything applied to
   * context.queryWhere before this gets called will also be in
   * context.queryCount.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static cloneQueryWhereIntoQueryCount(context, criteria) {
    context.queryCount = context.queryWhere.clone();
  }

  /**
   * Only sets the this.ID_ALIAS to queryWhere. Overwrite this if you want
   * more selected fields in the queryWhere query. Does not mutate queryCount.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereDefaultFields(context, criteria) {
    // For queryWhere we always have to set familyId, because it's needed
    // for the object key.
    context.queryWhere.field(this.ID_ALIAS);
  }

  /**
   * Applies Utils.setFields() to context.queryWhere with this.ALIASES_TO_FIELD_WITHOUT_ID.
   * Normally you shouldn't overwrite this function.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryWhereAdditionalFields(context, criteria) {
    // We only have to set fields specified if options.fields, otherwise all.
    Utils.setFields(context.queryWhere, this.ALIASES_TO_FIELD_WITHOUT_ID, context.fields);
  }

  /**
   * Sets the count field for queryCount. In case you need something else,
   * overwrite this function.
   * ToDo: add this.count to make it redundant to overwrite this function.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryCountFields(context, criteria) {
    context.queryCount.field('count(' + this.ID_ALIAS + ')', 'count');
  }

  /**
   * Sets limit and offset for queryWhere.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryLimitAndOffset(context, criteria) {
    // Set LIMIT and OFFSET for queryWhere (and only for queryWhere)
    Utils.setLimitAndOffset(context.queryWhere, criteria);
  }

  /**
   * You need to group your queries? Overwrite this function.
   * ToDo: Is this needed for any find*?
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static setQueryGroup(context, criteria) {

  }

  /**
   * Stringfies both queries queryWhere and queryCount.
   * If you named them differently, overwrite this method.
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static stringifyQuery(context, criteria) {
    // Stringify queries
    context.queryWhere = context.queryWhere.toString();
    logger.debug(this.name, '#find() queryWhere:', context.queryWhere);
    context.queryCount = context.queryCount.toString();
    logger.debug(this.name, '#find() queryCount:', context.queryCount);
  }

  /**
   * Executes queryWhere and queryCount in parallel and puts the results
   * in context.rowsWhere and context.rowCount (mind the missing s on rowCount).
   * You shouldn't need to overwrite this method if you don't rename the
   * queries.
   * @async
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   * @throws {Error}
   *         Only throws errors if something unexpected happens with sqlite.
   */
  static async executeQuery(context, criteria) {
    // Now we will execute both queries and catch the results
    [context.rowsWhere, context.rowCount] = await Promise
      .all([sqlite.all(context.queryWhere), sqlite.get(context.queryCount)]);

    logger.debug(this.name, '#find() rowsWhere:', context.rowsWhere);
    logger.debug(this.name, '#find() rowCount:', context.rowCount);
  }

  /**
   * Apply all info from context.rowsWhere to returnObject here.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectWhere(returnObject, context, criteria) {

  }

  /**
   * Applies all info from context.rowCount. So basically adds found
   * and remaining properties to returnObject. Normally no need to
   * overwrite this method.
   * @param  {object} returnObject
   *         object which will get returned later from #find().
   * @param  {object} context
   *         Internal context object
   * @param  {object} criteria
   *         Criteria object passed to find()
   */
  static buildReturnObjectCount(returnObject, context, criteria) {
    logger.debug(this.name, '#find() length RowsWhere:', context.rowsWhere.length);
    Utils.addFoundAndRemainingFromCountToReturnObject(
      context.rowCount,
      context.rowsWhere.length,
      returnObject,
      criteria
    );

  }
}

// Table name. Eg: families
GenericFind.TABLE;

// Array of all queryable aliases. Eg. ['familyId', 'familyName'...]
GenericFind.SEARCHABLE_ALIASES;

// Alias for id field. Eg. familyId
GenericFind.ID_ALIAS;

GenericFind.ALIASES_TO_FIELD_WITHOUT_ID;

module.exports = GenericFind;
