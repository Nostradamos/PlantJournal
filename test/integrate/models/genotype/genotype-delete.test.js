/* eslint-env node, mocha */
'use strict';

require('should');
const sqlite = require('sqlite');

const plantJournal = require('../../../../src/pj');
const CONSTANTS = require('../../../../src/constants');

describe(`Genotype()`, () => {
  describe(`#delete()`, async () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      // familyId:1
      await pj.Family.add({familyName: 'test1'});
      // generationId: 1
      await pj.Generation.add({generationName : 'testGen1', familyId: 1});
      // plantId: 1 genotypeId: 1
      await pj.Plant.add({generationId: 1, plantName: 'blubb'});
      // plantId: 2 genotyeId: 2
      await pj.Plant.add({generationId: 1, plantName: 'blubb2'});

      // familyId:2
      await pj.Family.add({familyName: 'testB'});
      // generationId: 2
      await pj.Generation.add({generationName : 'testGen2', familyId: 2});
      // generationId: 3
      await pj.Generation.add({generationName : 'testGen3', familyId: 2});
      // plantId: 3 genotypeId: 3
      await pj.Plant.add({generationId: 2, plantName: 'blubb'});

      // familyId:3
      await pj.Family.add({familyName: 'test3'});
      // generationId: 4
      await pj.Generation.add({generationName : 'testGen4', familyId: 3});
      // genotypeId: 4
      await pj.Genotype.add({generationId: 4, genotypeName: 'testGeno1'});
      // genotypeId: 5
      await pj.Genotype.add({generationId: 4, genotypeName: 'testGeno2'});

      // familyId:4
      await pj.Family.add({familyName: 'testD'});

      await pj.Plant.add(
        {generationId: 1, plantName: 'blubbClone', plantClonedFrom: 1});
    });

    after(async () => {
      await pj.disconnect();
    });

    it(`should throw error if no criteria object got passed`, async () => {
      await pj.Genotype.delete()
        .should.be.rejectedWith('No criteria object passed');
    });

    it(`should delete genotype specified in criteria.where.generationId referenced plants`, async () => {
      let deletedGeno = await pj.Genotype.delete({where: {genotypeId: 1}});

      deletedGeno.should.deepEqual({genotypes: [1], plants: [1, 4]});

      // Make sure we deleted also from database
      let rowsFam = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_FAMILY}, ${CONSTANTS.ATTR_NAME_FAMILY}
        FROM ${CONSTANTS.TABLE_FAMILY}`);

      rowsFam.should.deepEqual(
        [
          {familyId: 1, familyName: 'test1'},
          {familyId: 2, familyName: 'testB'},
          {familyId: 3, familyName: 'test3'},
          {familyId: 4, familyName: 'testD'}
        ]
      );

      let rowsGen = await sqlite.all(`
        SELECT
          ${CONSTANTS.ATTR_ID_GENERATION},
          ${CONSTANTS.ATTR_NAME_GENERATION}
        FROM ${CONSTANTS.TABLE_GENERATION}`);

      rowsGen.should.deepEqual(
        [
          {generationId: 1, generationName: 'testGen1'},
          {generationId: 2, generationName: 'testGen2'},
          {generationId: 3, generationName: 'testGen3'},
          {generationId: 4, generationName: 'testGen4'}
        ]
      );

      let rowsGeno = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_GENOTYPE}, ${CONSTANTS.ATTR_NAME_GENOTYPE}
        FROM ${CONSTANTS.TABLE_GENOTYPE}`);

      rowsGeno.should.deepEqual(
        [
          {genotypeId: 2, genotypeName: ''},
          {genotypeId: 3, genotypeName: ''},
          {genotypeId: 4, genotypeName: 'testGeno1'},
          {genotypeId: 5, genotypeName: 'testGeno2'}
        ]
      );

      let rowsPlant = await sqlite.all(`
        SELECT ${CONSTANTS.ATTR_ID_PLANT}, ${CONSTANTS.ATTR_NAME_PLANT}
        FROM ${CONSTANTS.TABLE_PLANT}`);

      rowsPlant.should.deepEqual(
        [
          {plantId: 2, plantName: 'blubb2'}, {plantId: 3, plantName: 'blubb'}
        ]
      );
    });
  });
});
