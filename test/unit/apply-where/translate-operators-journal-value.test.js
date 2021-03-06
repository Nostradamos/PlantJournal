/* eslint-env node, mocha */
'use strict';

require('should');
const _ = require('lodash');
const squel = require('squel');

require('../../utils-test');

var TranslateOperatorsJournalValue = require(
  '../../../src/apply-where/translate-operators-journal-value');

describe(`TranslateOperatorsJournalValue`, () => {
  describe(`Operators`, () => {
    let crit, self;
    let TABLE_DOT_ATTR_RSTR = squel.rstr('journals.journalValue');

    beforeEach(() => {
      crit = {crit:null, args:[]};
      self = {
        table: 'journals',
        attr: 'journalValue',
        func: null,
        funcArgs: null,
        isPath: true
      };
    });

    describe('general operator tests', () => {
      it(`all operators should sanitize`, () => {
        let self = {
          table: 'journals',
          attr: 'journalValue',
          func: null,
          funcArgs: null,
          isPath: false
        };

        for(let operator in TranslateOperatorsJournalValue.OPERATORS) {
          // Skip operators which don't allow arguments
          if(_.indexOf(
            ['$has', '$nhas', '$contains', '$ncontains'], operator) !== -1)
            continue;

          let operatorFunc = TranslateOperatorsJournalValue.OPERATORS[operator];
          operatorFunc(self, true, crit);
          crit.args[1].should.eql('true');
          operatorFunc(self, {foo: 'bar'}, crit);
          crit.args[1].should.eql('{"foo":"bar"}');
          operatorFunc(self, '{"foo":"bar"}', crit);
          crit.args[1].should.eql('"{\\"foo\\":\\"bar\\"}"');


          // $in and $nin only sanitized array elements, not the array itself.
          if(operator !== '$in' && operator !== '$nin') {
            operatorFunc(self, ['foo', 'bar'], crit);
            crit.args[1].should.eql('["foo","bar"]');
          } else {
            operatorFunc(self, [['foo', 'bar'], true, {foo: 'bar'}], crit);
            crit.args[1].should.eql(['["foo","bar"]', 'true', '{"foo":"bar"}']);
          }
        }
      });

      it(`all operators should sanitize if self.isPath is true and operatorOptions is not an invalid JSON`, () => {
        let self = {
          table: 'journals',
          attr: 'journalValue',
          func: null,
          funcArgs: null,
          isPath: true
        };

        for(let operator in TranslateOperatorsJournalValue.OPERATORS) {
          // Skip operators which don't allow arguments
          if(_.indexOf(
            ['$has', '$nhas', '$contains', '$ncontains'], operator) !== -1)
            continue;

          let operatorFunc = TranslateOperatorsJournalValue.OPERATORS[operator];
          operatorFunc(self, true, crit);
          crit.args[1].should.eql('true');
          operatorFunc(self, {foo: 'bar'}, crit);
          crit.args[1].should.eql('{"foo":"bar"}');
          operatorFunc(self, '{"foo":"bar"}', crit);
          crit.args[1].should.eql('"{\\"foo\\":\\"bar\\"}"');

          // $in and $nin only sanitized array elements, not the array itself.
          if(operator !== '$in' && operator !== '$nin') {
            operatorFunc(self, ['foo', 'bar'], crit);
            crit.args[1].should.eql('["foo","bar"]');
          } else {
            operatorFunc(self, [['foo', 'bar'], true, {foo: 'bar'}], crit);
            crit.args[1].should.eql(['["foo","bar"]', 'true', '{"foo":"bar"}']);
          }
        }
      });
    });

    describe(`#operatorEquals()`, () => {
      it(`should do TABLE.ATTR = OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorEquals(self, 'bar', crit);
        crit.should.eql(
          {crit: '? = ?', args: [TABLE_DOT_ATTR_RSTR, 'bar']});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) = OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorEquals(self, 'bar', crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) = ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 'bar']
          });
      });
    });

    describe(`#operatorNotEquals()`, () => {
      it(`should do TABLE.ATTR != OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorNotEquals(self, 'bar', crit);
        crit.should.eql(
          {crit: '? != ?', args: [TABLE_DOT_ATTR_RSTR, 'bar']});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) != OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorNotEquals(self, 'bar', crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) != ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 'bar']
          });
      });
    });

    describe(`#operatorGreatherThan()`, () => {
      it(`should do TABLE.ATTR > OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorGreatherThan(
          self, 13, crit);
        crit.should.eql(
          {crit: '? > ?', args: [TABLE_DOT_ATTR_RSTR, 13]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) > OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorGreatherThan(
          self, 13, crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) > ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 13]
          });
      });
    });

    describe(`#operatorGreatherThanEqual()`, () => {
      it(`should do TABLE.ATTR >= OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorGreatherThanEqual(
          self, 13, crit);
        crit.should.eql(
          {crit: '? >= ?', args: [TABLE_DOT_ATTR_RSTR, 13]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) >= OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorGreatherThanEqual(
          self, 13, crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) >= ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 13]
          });
      });
    });

    describe(`#operatorLowerThan()`, () => {
      it(`should do TABLE.ATTR < OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorLowerThan(
          self, 13, crit);
        crit.should.eql(
          {crit: '? < ?', args: [TABLE_DOT_ATTR_RSTR, 13]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) < OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorLowerThan(
          self, 13, crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) < ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 13]
          });
      });
    });

    describe(`#operatorLowerThanEqual()`, () => {
      it(`should do TABLE.ATTR <= OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorLowerThanEqual(
          self, 13, crit);
        crit.should.eql(
          {crit: '? <= ?', args: [TABLE_DOT_ATTR_RSTR, 13]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) <= OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorLowerThanEqual(
          self, 13, crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) <= ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, 13]
          });
      });
    });

    describe(`#operatorLike()`, () => {
      it(`should do TABLE.ATTR LIKE OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorLike(
          self, '_est', crit);
        crit.should.eql(
          {crit: '? LIKE ?', args: [TABLE_DOT_ATTR_RSTR, '_est']});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) LIKE OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorLike(
          self, '_est', crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) LIKE ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, '_est']
          });
      });
    });

    describe(`#operatorNotLike()`, () => {
      it(`should do TABLE.ATTR NOT LIKE OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorNotLike(self, '_est', crit);
        crit.should.eql(
          {crit: '? NOT LIKE ?', args: [TABLE_DOT_ATTR_RSTR, '_est']});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) NOT LIKE OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorNotLike(self, '_est', crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) NOT LIKE ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, '_est']
          });
      });
    });

    describe(`#operatorIn()`, () => {
      it(`should do TABLE.ATTR IN OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorIn(self, ['foo', 'bar'], crit);
        crit.should.eql(
          {crit: '? IN ?', args: [TABLE_DOT_ATTR_RSTR, ['foo', 'bar']]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) IN OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorIn(self, ['foo', 'bar'], crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) IN ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, ['foo', 'bar']]
          });
      });
    });

    describe(`#operatorNotIn()`, () => {
      it(`should do TABLE.ATTR NOT IN OPERATOROPTIONS if self.func and self.funcArgs are null`, () => {
        TranslateOperatorsJournalValue.operatorNotIn(
          self, ['foo', 'bar'], crit);
        crit.should.eql(
          {crit: '? NOT IN ?', args: [TABLE_DOT_ATTR_RSTR, ['foo', 'bar']]});
      });

      it(`should do json_extract(TABLE.ATTR, PATH) NOT IN OPERATOROPTIONS if self.func is json_extract and self.funcArgs is PATH`, () => {
        self.func = 'json_extract';
        self.funcArgs = ['$.foo.bar[1]'];
        TranslateOperatorsJournalValue.operatorNotIn(
          self, ['foo', 'bar'], crit);
        crit.should.eql(
          {
            crit: 'json_extract(?, ?) NOT IN ?',
            args: [TABLE_DOT_ATTR_RSTR, ...self.funcArgs, ['foo', 'bar']]
          });
      });
    });

    describe(`#operatorHas()`, () => {
      it(`should do json_type(..., '$.path') IS NOT NULL`, () => {
        self.funcArgs = ['$.foo.bar'];
        TranslateOperatorsJournalValue.operatorHas(
          self, 'key', crit);
        crit.should.eql(
          {
            crit: 'json_type(?, ?) IS NOT NULL',
            args: [TABLE_DOT_ATTR_RSTR, '$.foo.bar."key"']
          }
        );
      });
    });

    describe(`#operatorNotHas()`, () => {
      it(`should do json_type(..., '$.path') IS NULL`, () => {
        self.funcArgs = ['$.foo.bar'];
        TranslateOperatorsJournalValue.operatorNotHas(
          self, 'key', crit);
        crit.should.eql(
          {
            crit: 'json_type(?, ?) IS NULL',
            args: [TABLE_DOT_ATTR_RSTR, '$.foo.bar."key"']
          }
        );
      });
    });

    describe(`#operatorContains()`, () => {
      it(`should do EXISTS (SELECT value FROM journals.journalValue WHERE ...)`, () => {
        self.funcArgs = ['$.foo.bar'];
        TranslateOperatorsJournalValue.operatorContains(
          self, 'someval', crit);
        crit.crit.should.eql('EXISTS ?');
        crit.args[0].toString().should.sqlEql(
          `SELECT value FROM json_each(journals.journalValue, '$.foo.bar')
           WHERE (value = 'someval')`);
      });
    });

    describe(`#operatorNotContains()`, () => {
      it(`should do EXISTS (SELECT value FROM journals.journalValue WHERE ...)`, () => {
        self.funcArgs = ['$.foo.bar'];
        TranslateOperatorsJournalValue.operatorNotContains(
          self, 'someval', crit);
        crit.crit.should.eql('NOT EXISTS ?');
        crit.args[0].toString().should.sqlEql(
          `SELECT value FROM json_each(journals.journalValue, '$.foo.bar')
           WHERE (value = 'someval')`);
      });
    });
  });
});
