'use strict';
const _ = require('lodash');

const CONSTANTS = exports;

// Even if the aliases start with the default table name,
// if references the alias (which is always the default table name).
// Eg: SELECT ... FROM families `families`...
CONSTANTS.FIELD_ALIASES_FAMILY = {
  'familyName': 'families.familyName',
  'familyCreatedAt': 'families.familyCreatedAt',
  'familyModifiedAt': 'families.familyModifiedAt'
}

CONSTANTS.FIELD_ALIASES_GENERATION = {
  'generationName': 'generations.generationName',
  'generationParents': 'group_concat(generation_parents.plantId) as generationParents',
  'generationCreatedAt': 'generations.generationCreatedAt',
  'generationModifiedAt': 'generations.generationModifiedAt'
}

CONSTANTS.FIELD_ALIASES_GENOTYPE = {
  'genotypeName': 'genotypes.genotypeName',
  'genotypeCreatedAt': 'genotypes.genotypeCreatedAt',
  'genotypeModifiedAt': 'genotypes.genotypeModifiedAt',
}

CONSTANTS.FIELD_ALIASES_PLANT = {
  'plantName': 'plants.plantName',
  'plantClonedFrom': 'plants.plantClonedFrom',
  'plantSex': 'plants.plantSex',
  'plantCreatedAt': 'plants.plantCreatedAt',
  'plantModifiedAt': 'plants.plantModifiedAt',
}

CONSTANTS.ID_FIELD_FAMILY = 'familyId';
CONSTANTS.ID_FIELD_GENERATION = 'generationId';
CONSTANTS.ID_FIELD_GENOTYPE = 'genotypeId';
CONSTANTS.ID_FIELD_PLANT = 'plantId';

CONSTANTS.TABLE_FAMILIES = 'families';
CONSTANTS.TABLE_GENERATIONS = 'generations';
CONSTANTS.TABLE_GENERATION_PARENTS = 'generation_parents';
CONSTANTS.TABLE_GENOTYPES = 'genotypes';
CONSTANTS.TABLE_PLANTS = 'plants';

CONSTANTS.PLANT_SEXES = ['male', 'female', 'hermaphrodite', null];

CONSTANTS.FIELD_CREATED_AT = 'createdAt';
CONSTANTS.FIELD_MODIFIED_AT = 'modifiedAt';

// Those we generate based on the constants defined before.
CONSTANTS.FIELDS_FAMILY = _.concat(_.keys(CONSTANTS.FIELD_ALIASES_FAMILY), CONSTANTS.ID_FIELD_FAMILY);
CONSTANTS.FIELDS_GENERATION = _.concat(_.keys(CONSTANTS.FIELD_ALIASES_GENERATION), CONSTANTS.ID_FIELD_GENERATION);
CONSTANTS.FIELDS_GENOTYPE = _.concat(_.keys(CONSTANTS.FIELD_ALIASES_GENOTYPE), CONSTANTS.ID_FIELD_GENOTYPE);
CONSTANTS.FIELDS_PLANT = _.concat(_.keys(CONSTANTS.FIELD_ALIASES_PLANT), CONSTANTS.ID_FIELD_PLANT);

CONSTANTS.ALLOWED_FIELDS_FAMILY = CONSTANTS.FIELDS_FAMILY;
CONSTANTS.ALLOWED_FIELDS_GENERATION = _.concat(CONSTANTS.ALLOWED_FIELDS_FAMILY, CONSTANTS.FIELDS_GENERATION);
CONSTANTS.ALLOWED_FIELDS_GENOTYPE = _.concat(CONSTANTS.ALLOWED_FIELDS_GENERATION, CONSTANTS.FIELDS_GENOTYPE);
CONSTANTS.ALLOWED_FIELDS_PLANT = _.concat(CONSTANTS.ALLOWED_FIELDS_GENOTYPE, CONSTANTS.FIELDS_PLANT);