'use strict';

const _ = require('lodash');
const squel = require('squel');
const sqlite = require('sqlite');

const logger = require('../logger');
const Utils = require('../utils');
const QueryUtils = require('../utils-query');

const CONSTANTS = require('../constants');
const GenericUpdate = require('./generic-update');

/**
 * GenerationUpdate Class. Basically does the update() stuff for
 * Generations. See GenericUpdate for more detailed information
 * on how Update internally works. If you want to know how
 * to use this, see src/models/generation #update().
 */
class GenerationUpdate extends GenericUpdate {

  /**
   * We need to join some tables to make all FINDABLE_ALIASES of generation
   * work.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static setQueryFindJoin(context, update, criteria) {
    QueryUtils.joinRelatedGenerations(context.queryFind);
  }

  /**
   * We need to remove generationParents from queryUpdate.setFields.
   * generationParents has to get applied to TABLE_PARENTS and not normal
   * generation TABLE.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static setQueryUpdateFieldValues(context, update, criteria) {
    // generationParents has to be in a different table, so leave it out
    // for the main update query
    context.queryUpdate.setFields(
      _.omit(context.fieldsToUpdate, 'generationParents')
    );
  }

  /**
   * Inits two new queries. queryDeleteOldParents
   * and queryInsertNewParents. First one is to delete
   * all old parents, second to insert new parent plant ids.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   */
  static initQueryUpdateParents(context, update, criteria) {
    // We have to delete the old parents, build query for this
    context.queryDeleteOldParents = squel.remove().from(this.TABLE_PARENTS)
      .where('generationId IN ?', context.idsToUpdate).toString();
    logger.debug(this.name, '#update() queryDeleteOldParents:', context.queryDeleteOldParents);

    // Wa have to insert new parents, build query for this
    let fieldsRows = [];
    _.each(update.generationParents, function(parentPlantId) {
      _.each(context.idsToUpdate, function(generationId) {
        fieldsRows.push({parentId: null, generationId: generationId, plantId: parentPlantId});
      });
    });
    context.queryInsertNewParents = squel.insert().into(this.TABLE_PARENTS)
      .setFieldsRows(fieldsRows)
      .toString();
  }

  /**
   * Executes context.queryDeleteOldParents and context.queryInsertNewParents
   * in a transaction. If query fails because of foreign key, transaction
   * will get rolled back (deletes will be undone) and an Error will be thrown.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   * @return {Promise}          [description]
   */
  static async executeQueryUpdateParents(context, update, criteria) {
    try {
      await sqlite.get('BEGIN');
      await sqlite.get(context.queryDeleteOldParents);
      await sqlite.get(context.queryInsertNewParents);
      await sqlite.get('COMMIT');
    } catch(err) {
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        await sqlite.get('ROLLBACK'); // Undo delete
        throw new Error('update.generationParents does not reference to existing Plants. At least one reference is invalid.');
      }
      throw err;
    }
  }

  /**
   * We have to modify the behaviour of execution because we have to also
   * query TABLE_PARENTS if generationParents is in fieldsToUpdate. Besides
   * that we catch foreign key errors and throw our own error.
   * @param  {object} context   - Internal context object
   * @param  {object} update    - Updated object passed to update()
   * @param  {object} criteria  - Criteria object passed to update()
   * @return {Promise}          [description]
   */
  static async executeQueryUpdate(context, update, criteria) {
    if(_.has(context.fieldsToUpdate, 'generationParents')) {
      this.initQueryUpdateParents(context, update, criteria);
      await this.executeQueryUpdateParents(context, update, criteria);
    }

    try {
      await super.executeQueryUpdate(context, update, criteria);
    } catch(err) {
      if(err.message === 'SQLITE_CONSTRAINT: FOREIGN KEY constraint failed') {
        throw new Error('update.familyId does not reference an existing Family');
      }
      throw err;
    }
  }
}

GenerationUpdate.TABLE = CONSTANTS.TABLE_GENERATIONS;

GenerationUpdate.TABLE_PARENTS = CONSTANTS.TABLE_GENERATION_PARENTS;

GenerationUpdate.ID_FIELD = CONSTANTS.ID_ALIAS_GENERATION;

GenerationUpdate.MODIFIED_AT_FIELD = CONSTANTS.MODIFIED_AT_ALIAS_GENERATION;

GenerationUpdate.FINDABLE_ALIASES = CONSTANTS.ALIASES_ALL_GENERATION;

// Remove some fields we don't want to be updatable
GenerationUpdate.UPDATABLE_ALIASES = _.without(
  CONSTANTS.ALIASES_ONLY_GENERATION,
  CONSTANTS.ID_ALIAS_GENERATION,
  CONSTANTS.MODIFIED_AT_ALIAS_GENERATION,
  CONSTANTS.CREATED_AT_ALIAS_GENERATION
);

// Add some fields we want to be updatable
GenerationUpdate.UPDATABLE_ALIASES = _.concat(
  GenerationUpdate.UPDATABLE_ALIASES,
  CONSTANTS.ID_ALIAS_FAMILY
);

module.exports = GenerationUpdate;