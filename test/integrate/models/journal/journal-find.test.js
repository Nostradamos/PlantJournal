/* eslint-env node, mocha */
'use strict';

const plantJournal = require('../../../../src/pj');

require('should');

describe(`Journal()`, () => {
  describe(`#find()`, () => {
    let pj;

    before(async () => {
      pj = new plantJournal(':memory:');
      await pj.connect();
      await pj.Environment.add({
        environmentName: 'Greenhouse #1',
        environmentDescription: 'This is the first greenhouse in my garden.'});
      await pj.Medium.add({mediumName: 'Pot #1', environmentId: 1});
      await pj.Medium.add({mediumName: 'Pot #2', environmentId: 1});
      await pj.Genotype.add({});
      await pj.Plant.add({plantName: 'testPlant1', genotypeId: 1});

      await pj.Journal.add({
        journalDatetime: 1337,
        journalType: 'log',
        journalValue: 'This is a log',
        plantId: 1});
      await pj.Journal.add({
        journalDatetime: 1337,
        journalType: 'ph-sensor',
        journalValue: 6.5,
        mediumId: 1});
      await pj.Journal.add({
        journalDatetime: 1337,
        journalType: 'ec-sensor',
        journalValue: 1.3,
        mediumId: 1});
      await pj.Journal.add({
        journalDatetime: 1337,
        journalType: 'temp-sensor',
        journalValue: 28.7,
        environmentId: 1});
      await pj.Journal.add({
        journalDatetime: 1555,
        journalType: 'log',
        journalValue: 'This is a log',
        plantId: 1});
      await pj.Journal.add({
        journalDatetime: 1555,
        journalType: 'watering',
        journalValue: {
          amount: 1.5,
          n: 3,
          p: 4,
          k: 1.7,
          fertilizers: ['Hakaphos Grün', 'Hakaphos Blau']
        },
        mediumId: 1});
      await pj.Journal.add({
        journalDatetime: 1337,
        journalType: 'ph-sensor',
        journalValue: 6.8,
        mediumId: 2});
      await pj.Journal.add({
        journalDatetime: 4220,
        journalType: 'test-bool',
        journalValue: true,
        plantId: 1});

      await pj.Journal.add({
        journalDatetime: 4221,
        journalType: 'test-bool',
        journalValue: false,
        plantId: 1});
    });

    after(async () => {
      await pj.disconnect();
    });


    it(`should return all journals`, async () => {
      let journals = await pj.Journal.find();
      journals.should.containDeep(
        {
          found: 9,
          remaining: 0,
          journals:  {
            1: {
              journalId: 1,
              journalDatetime: 1337,
              journalType: 'log',
              journalValue: 'This is a log',
              plantId: 1
            },
            2: {
              journalId: 2,
              journalDatetime: 1337,
              journalType: 'ph-sensor',
              journalValue: 6.5,
              mediumId: 1
            },
            3: {
              journalId: 3,
              journalDatetime: 1337,
              journalType: 'ec-sensor',
              journalValue: 1.3,
              mediumId: 1
            },
            4: {
              journalId: 4,
              journalDatetime: 1337,
              journalType: 'temp-sensor',
              journalValue: 28.7,
              environmentId: 1
            },
            5: {
              journalId: 5,
              journalDatetime: 1555,
              journalType: 'log',
              journalValue: 'This is a log',
              plantId: 1
            },
            6: {
              journalId: 6,
              journalDatetime: 1555,
              journalType: 'watering',
              journalValue: {
                amount:1.5,
                n:3,
                p:4,
                k:1.7,
                fertilizers: ['Hakaphos Grün','Hakaphos Blau']
              },
              mediumId: 1
            },
            7: {
              journalId: 7,
              journalDatetime: 1337,
              journalType: 'ph-sensor',
              journalValue: 6.8
            },
            8: {
              journalId: 8,
              journalDatetime: 4220,
              journalType: 'test-bool',
              journalValue: true,
              plantId: 1,
            },
            9: {
              journalId: 9,
              journalDatetime: 4221,
              journalType: 'test-bool',
              journalValue: false,
              plantId: 1,
            }
          }
        }
      );
    });

    it(`should be possible to find journals for a specific medium`, async () => {
      let journals = await pj.Journal.find({where: {mediumId: {$neq: null}}});
      journals.should.containDeep(
        {
          found: 4,
          remaining: 0,
          journals:  {
            2: {
              journalId: 2,
              journalDatetime: 1337,
              journalType: 'ph-sensor',
              journalValue: 6.5,
              mediumId: 1
            },
            3: {
              journalId: 3,
              journalDatetime: 1337,
              journalType: 'ec-sensor',
              journalValue: 1.3,
              mediumId: 1
            },
            6: {
              journalId: 6,
              journalDatetime: 1555,
              journalType: 'watering',
              journalValue: {
                amount:1.5,
                n:3,
                p:4,
                k:1.7,
                fertilizers: ['Hakaphos Grün','Hakaphos Blau']
              },
              mediumId: 1
            },
            7: {
              journalId: 7,
              journalDatetime: 1337,
              journalType: 'ph-sensor',
              journalValue: 6.8
            }
          }
        }
      );
    });

    it(`should be possible to search through journalValue JSON object`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalType: 'watering', 'journalValue.amount': 1.5}});
      journals.should.containDeep(
        {
          found: 1,
          remaining: 0,
          journals:  {
            6: {
              journalId: 6,
              journalDatetime: 1555,
              journalType: 'watering',
              journalValue: {
                amount: 1.5,
                n:3,
                p:4,
                k:1.7,
                fertilizers: ['Hakaphos Grün','Hakaphos Blau']
              },
              mediumId: 1
            }
          }
        }
      );
    });

    it(`should be possible to search for unquoted booleans`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalType: 'test-bool', journalValue: true}});
      journals.should.containDeep(
        {
          found: 1,
          remaining: 0,
          journals:  {
            8: {
              journalId: 8,
              journalDatetime: 4220,
              journalType: 'test-bool',
              journalValue: true,
              plantId: 1,
            },
          }
        }
      );
    });

    it(`should be possible to search for array`, async () => {
      let journals = await pj.Journal.find({
        where: {'journalValue.fertilizers': ['Hakaphos Grün','Hakaphos Blau']
        }});

      journals.should.containDeep({
        found: 1,
        remaining: 0,
        journals:  {
          6: {
            journalId: 6,
            journalDatetime: 1555,
            journalType: 'watering',
            journalValue: {
              amount:1.5,
              n:3,
              p:4,
              k:1.7,
              fertilizers: ['Hakaphos Grün','Hakaphos Blau']
            },
            mediumId: 1
          }
        }
      });
    });

    it(`should find boolean where they are true or false with $in: [true, false]`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalValue: {$in: [true, false]}}});
      journals.should.containDeep({
        found: 2,
        remaining: 0,
        journals:  {
          8: {
            journalId: 8,
            journalDatetime: 4220,
            journalType: 'test-bool',
            journalValue: true,
            plantId: 1,
          },
          9: {
            journalId: 9,
            journalDatetime: 4221,
            journalType: 'test-bool',
            journalValue: false,
            plantId: 1,
          }
        }
      });
    });

    it(`should find equal strings for journalValue`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalValue: 'This is a log'}});
      journals.should.containDeep({
        found: 2,
        remaining: 0,
        journals:  {
          1: {
            journalId: 1,
            journalDatetime: 1337,
            journalType: 'log',
            journalValue: 'This is a log',
            plantId: 1
          },
          5: {
            journalId: 5,
            journalDatetime: 1555,
            journalType: 'log',
            journalValue: 'This is a log',
            plantId: 1
          },
        }
      });
    });

    it(`should find all journals where journalValue has the key 'n'`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalValue: {$has: 'n'}}});
      journals.should.containDeep({
        found: 1,
        remaining: 0,
        journals:  {
          6: {
            journalId: 6,
            journalDatetime: 1555,
            journalType: 'watering',
            journalValue: {
              amount:1.5,
              n:3,
              p:4,
              k:1.7,
              fertilizers: ['Hakaphos Grün','Hakaphos Blau']
            },
            mediumId: 1
          },
        }
      });
    });

    it(`should find all journals where journalValue has NOT the key 'n'`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalValue: {$nhas: 'n'}}});
      journals.should.containDeep({
        found: 8,
        remaining: 0,
        journals:  {
          1: {
            journalId: 1,
            journalDatetime: 1337,
            journalType: 'log',
            journalValue: 'This is a log',
            plantId: 1
          },
          2: {
            journalId: 2,
            journalDatetime: 1337,
            journalType: 'ph-sensor',
            journalValue: 6.5,
            mediumId: 1
          },
          3: {
            journalId: 3,
            journalDatetime: 1337,
            journalType: 'ec-sensor',
            journalValue: 1.3,
            mediumId: 1
          },
          4: {
            journalId: 4,
            journalDatetime: 1337,
            journalType: 'temp-sensor',
            journalValue: 28.7,
            environmentId: 1
          },
          5: {
            journalId: 5,
            journalDatetime: 1555,
            journalType: 'log',
            journalValue: 'This is a log',
            plantId: 1
          },
          7: {
            journalId: 7,
            journalDatetime: 1337,
            journalType: 'ph-sensor',
            journalValue: 6.8
          },
          8: {
            journalId: 8,
            journalDatetime: 4220,
            journalType: 'test-bool',
            journalValue: true,
            plantId: 1,
          },
          9: {
            journalId: 9,
            journalDatetime: 4221,
            journalType: 'test-bool',
            journalValue: false,
            plantId: 1,
          }
        }
      });
    });

    it(`should find all journals where journalValue has a value with 1.5`, async () => {
      let journals = await pj.Journal.find(
        {where: {journalValue: {$contains: 1.5}}});
      journals.should.containDeep(
        {
          found: 1,
          remaining: 0,
          journals:  {
            6: {
              journalId: 6,
              journalDatetime: 1555,
              journalType: 'watering',
              journalValue: {
                amount:1.5,
                n:3,
                p:4,
                k:1.7,
                fertilizers: ['Hakaphos Grün','Hakaphos Blau']
              },
              mediumId: 1
            },
          }
        }
      );
    });

    it(`should find all journals where journalValue.fertilizers has 'Hakaphos Grün' inside`, async () => {
      let journals = await pj.Journal.find(
        {where: {'journalValue.fertilizers': {$contains: 'Hakaphos Grün'}}});
      journals.should.containDeep(
        {
          found: 1,
          remaining: 0,
          journals:  {
            6: {
              journalId: 6,
              journalDatetime: 1555,
              journalType: 'watering',
              journalValue: {
                amount:1.5,
                n:3,
                p:4,
                k:1.7,
                fertilizers: ['Hakaphos Grün','Hakaphos Blau']
              },
              mediumId: 1
            },
          }
        }
      );
    });

    it(`should find all journals where journalValue.fertilizers has 'Hakaphos Lila' inside, and therefore find nothing`, async () => {
      let journals = await pj.Journal.find(
        {where: {'journalValue.fertilizers': {$contains: 'Hakaphos Lila'}}});
      journals.should.containDeep(
        {
          found: 0,
          remaining: 0,
          journals:  {}
        }
      );
    });
  });
});
