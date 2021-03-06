[![Build Status](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite3.svg?branch=master)](https://travis-ci.org/Nostradamos/plantjournal-api-sqlite3)
[![dependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite3/status.svg)](https://david-dm.org/Nostradamos/plantjournal-api-sqlite3) [![devDependencies Status](https://david-dm.org/Nostradamos/plantjournal-api-sqlite3/dev-status.svg)](https://david-dm.org/Nostradamos/plantjournal-api-sqlite3?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/Nostradamos/plantjournal-api-sqlite3/badge.svg?branch=master)](https://coveralls.io/github/Nostradamos/plantjournal-api-sqlite3?branch=master)

plantjournal-api-sqlite3
=======================

This repo contains a plantJournal API connector implementation using sqlite3 as the database engine.

API
======

## Connect to sqlite3 database

You can connect to a sql database file with:
```javascript
var pj = new plantJournal();
await pj.connect('./database.sql');
```

Or if you want to keep the database in memory, use:
```javascript
var pj = new plantJournal();
await pj.connect(':memory:');
```

To catch errors, surround `pj.connect()` with a try/catch block.

```javascript
var pj = new plantJournal();
try {
    await pj.connect('./database.sql'); // same for :memory:
} catch(err) {
    // ToDo: handle error here
}
```


## Create a model record

We have a variety of models with different attributes. See "Models/Tables" for detailed information and a list of all models. This includes Family, Generation, Plant....

To create a new model record, you have to call `pj.{Model}.create({options})`, where `{Model}` is the model name, and `{options}` an object with attributes this new model record should have. Check out "Models/Tables" to get more detailed information which attributes are required (and therefore have to be set if you don't want to get any errors) and which additional/optional attributes you can set.

**Example #1:**
```javascript
await pj.Family.create({
    familyName: 'testFamily'
});
```

**Example #2:**
```javascript
await pj.Plant.create({
    plantName: 'Some chili plant',
    genotypeId: 3
});
```

If you create a new record, `pj.{Model}.create{)` returns the newly created record as an object.

**Example #1:**
```javascript
let family = pj.Family.create({
    familyName: 'testFamily'
});

// console.log(family);
// {
//   'families': {
//      1: {
//        familyName: 'testFamily',
//        familyDescription: '',
//        familyAddedAt: 12354,
//        familyModifiedAt: 12354
//      },
// }
```

Models/Tables
=============

## Family

**Attribute:** Name of the attribute  
**Type:** Type of this attribute  
**Default:** Has an default value, not needed to specify this on create (if internal flag is selected too, you can't even).  
**Required:** Attribute is required on create.  
**Internal:** This attribute gets filled in internally, and can only get modified indirectly by api user.

|     Attribute     |   Type   | Required |      Default      | Internal | Description |
| ----------------- | -------- | -------- | ----------------- | -------- | ----------- |
| familyId          | int      |          | AUTO_INCREMENT    | *        |             |
| familyName        | text     | *        |                   |          |             |
| familyDescription | text     |          | ""                |          |             |
| familyAddedAt   | datetime |          | CURRENT_DATETIME | *        |             |
| familyModifiedAt  | datetime |          | CURRENT_DATETIME | *        |             |

## Generation (=generations)

| Attribute             | Type      | Required | Default           | Internal | Description |
| --------------------- | --------- | -------- | ----------------- | -------- | ----------- |
| generationId          | int       |          | AUTO_INCREMENT    | *        |             |
| generationName        | text      |          |                   |          |             |
| generationDescription | text      |          | ""                |          |             |
| generationParents     | plantId[] |          | []                |          |             |
| generationAddedAt   | datetime  |          | CURRENT_DATETIME | *        |             |
| generationModifiedAt  | datetime  |          | CURRENT_DATETIME | *        |             |
| familyId              | familyId  | *        |                   |          |             |

## Genotype (=genotypes)

|      Attribute      |     Type     | Required |      Default      | Internal | Description |
| ------------------- | ------------ | -------- | ----------------- | -------- | ----------- |
| genotypeId          | int          |          | AUTO_INCREMENT    | *        |             |
| genotypeName        | text         |          |                   |          |             |
| genotypeDescription | text         |          | ""                |          |             |
| genotypeAddedAt   | datetime     |          | CURRENT_DATETIME | *        |             |
| genotypeModifiedAt  | datetime     |          | CURRENT_DATETIME | *        |             |
| generationId        | generationId | *        |                   |          |             |

## Plant (=plants)

| Attribute        | Type       | Required | Default           | Internal | Description |
| ---------------- | ---------- | -------- | ----------------- | -------- | ----------- |
| plantId          | int        |          | AUTO_INCREMENT    | *        |             |
| plantName        | text       | *        |                   |          |             |
| plantSex         | text       |          | null              |          |             |
| plantClonedFrom  | plantId    |          | null              |          |             |
| plantDescription | text       |          | ""                |          |             |
| plantAddedAt   | datetime   |          | CURRENT_DATETIME | *        |             |
| plantModifiedAt  | datetime   |          | CURRENT_DATETIME | *        |             |
| genotypeId       | genotypeId | *        |                   |          |             |
| mediumId         | mediumId   | *        |                   |          |             |

## Medium (=mediums)

|     Attribute     |     Type      | Required |      Default      | Internal | Description |
| ----------------- | ------------- | -------- | ----------------- | -------- | ----------- |
| mediumId          | int           |          | AUTO_INCREMENT    | *        |             |
| mediumName        | text          | *        | ""                |          |             |
| mediumDescription | text          |          | ""                |          |             |
| mediumAddedAt   | datetime      |          | CURRENT_DATETIME | *        |             |
| mediumModifiedAt  | datetime      |          | CURRENT_DATETIME | *        |             |
| environmentId     | environmentId | *        |                   |          |             |

## Environment (=environments)

|       Attribute        |   Type   | Required |      Default      | Internal | Description |
| ---------------------- | -------- | -------- | ----------------- | -------- | ----------- |
| environmentId          | int      |          | AUTO_INCREMENT    | *        |             |
| environmentName        | text     | *        |                   |          |             |
| environmentDescription | text     |          |                   |          |             |
| environmentAddedAt   | datetime |          | CURRENT_DATETIME | *        |             |
| environmentModifiedAt  | datetime |          | CURRENT_DATETIME | *        |             |

## Journal (=journals)

NOTE: You can only set one of the attributes where required is "\*\*"

| Attribute         | Type          | Required | Default           | Internal | Description |
| ----------------- | ------------- | -------- | ----------------- | -------- | ----------- |
| journalId         | int           |          | AUTO_INCREMENT    | *        |             |
| journalDatetime  | datetime      | *        |                   |          |             |
| journalType       | text          | *        |                   |          |             |
| journalValue      | json          | *        |                   |          |             |
| journalAddedAt  | datetime      |          | CURRENT_DATETIME | *        |             |
| journalModifiedAt | datetime      |          | CURRENT_DATETIME | *        |             |
| plantId           | plantId       | **       |                   |          |             |
| mediumId          | mediumId      | **       |                   |          |             |
| environmentId     | environmentId | **       |                   |          |             |

# Query Operators

## Operators for most attributes
NOTE: This excludes the special cases `generationParents` and `journalValue`. Scroll to the next sections to get details about the operators available for those special cases.

### $eq (equals)
### $neq (equals not)
### $gt (greater than)
### $gte (greater than equals)
### $lt (lower than)
### $lte (lower than equals)
### $in (in)
### $nin (not in)
### $like (like)
### $nlike (not like)

## Operators for `generationParents`
### $eq
Only find generation records which have exactly this parents. If operator value is a single integer, we will
only find generations which only have this parent. Otherwise operator value should be an array of plant ids.
### $neq
Only find generation records which have NOT this parents.
If operator value is a single integer, we will only find generations which don't have this parent.
Otherwise operator value should be an array of plant ids.
### $has
Only find generation records where this plantId(s) are parents of the generation. The generation can have also other parents. If operator value is a single integer, we will only find generations which have at least this plantId as a parent. Otherwise operator value should be an array of plantIds which a generation all should have.
### $nhas
Same as $neq.
### $count

## Operators for `journalValue`
### $eq (equals)
### $neq (equals not)
### $gt (greater than)
### $gte (greater than equals)
### $lt (lower than)
### $lte (lower than equals)
### $in (in)
### $nin (not in)
### $like (like)
### $nlike (not like)
### $has
### $nhas
### $type
### $len

# Journal Types

## `log`
General text logging for markdown

Valid records: plant, medium, environment
### Example:
```
{
    journalType: 'log-markdown',
    journalValue: 'Lorem Ipsum
    Asd dasldk'
}
```


## `water`
An first prototype on how we could log a watering of a medium (which means
one or more plants)

Valid records: medium
### Example #1:
```
{
    journalType: 'water',
    journalValue: {
        amountL: 13.0,
        ec: 0.8
        ph: 6.5
        fertRatioTotal: {
            n: 5
            p: 7
        },
        fertilizers: {
            'Hakaphos Grün': {
                amountML: 13.1,
                // storeId: 13939
            },
            'Hakaphos Rot': {
                amountML: 20.1,
                // storeId: 1293
            }
        }
    }
}
```




# ToDo
* Implement files/pictures/media
* Add .on events
* Make it possible to create plants without need of generations/family?!
* Add resolveParents to find?!
* Add strain?!
* Don't always select id attributes
* Harden API against invalid user input
* Improve performance for sql by only joining tables if necessary
* Use CONSTANTS. and not hardcoded attribute/table names

# Development Notes/Coding Style

* Always use explicit column names (explicit => including table name) in your
  queries as soon as you join different tables. Why? Because for all
  foreign keys we use the same column name in source and destination table.
  SQLite can't know which table you mean, so we just use explicit column names
  for everything. Eg: `generations.familyId` references `families.familyId`.

* Try to use `CONSTANTS` wherever you can, especially for attributes. This makes
  it easier to change the attribute or variable names and reduces the risk of
  misspelling any constant, because we throw an error if you try to read an
  undefined property from constants (thanks to es6 proxies and zealot).

* Use lamda expression for all anonymous (and unassigned) functions. For named
  functions (also assigned functions) use `function()` style. If the shorter
  lamda expression allows you to fit max line length for named functions, feel
  free to use it.

* Descriptions of tests should get encapsulated inside of ``` ` to not need to
  escape `"` or `'` and make it possible to easily search the test. Besides
  that test description lines are allowed to have more than 80 characters, and
  it's prefered to do so, again to make it easier to find the test.

* SQLite3 queries should also be inside of ``` `, if they exceed one line.
  Queries which fit into one line can use the normal `''`. If the query exceeds
  one line (80 characters), break the line before FROM/WHERE/LIMIT/GROUP...
  and use tabs/indent to make the query readable. Try to make the queries
  easily readable, for examples have a look at some tests.
  NOTE: You can use the should.sqlEql assertion to test a single lined query
  against a multi line equal.

* Try to not use more than 80 characters per line. Only exceptions are strings
   encapsulated in an `it()`, `describ()` function for tests, or any
   `should.be.rejectedWith()` or `throw new Error()`.
