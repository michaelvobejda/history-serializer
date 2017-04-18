# history-serializers
Serializers for payment histories supplied by various data vendors.

# Pre-requisites
- Node v7.x. If you don't have a version manager see [here](http://nvm.sh)
- yarn or npm


# Usage
- To build: `npm run build`
- To test: `npm run build && npm test`

# Introduction

At Nova, all the data suppliers from the various countries we integrate with give us the value 'payment history'. This is a very important data value in the responses we get, as our paying customers (e.g. banks) use this value as a big weight to determine the applicant's overall risk.
Currently at Nova we have multiple countries integrated in our platform, which provide very different formats for the payment history field.
It is Nova's job to map the incoming payment history to one common format which we can use internally. This mapped format is used to have a very concise serialized string that is then passed around and stored in our PostgreSQL tier along the other data we get from the foreign data bureaus.
When a Nova customer (e.g. a bank) hits our API we can then de-serialize the Nova common format into any desired structure with extra analytics on top.

# The challenge
## Requirements

Write the serializer for country code `IND`. The interface should accept the payment-history string. Please do not pass in the country code as an argument but rather define your interface such to accommodate for multiple countries.

You can write the interface using any structure you'd like (factory functions,  classes, closures, etc...).
Keep in mind that it has to be flexible to any other country to be integrated in the future.

The deadline for this challenge is according to the deadline prescribed in the corresponding email.

## Assumptions
- You can treat it as async using promises or do it synchronously, whatever you want!
- Whenever the payment-history string is of unknown format, when the other arguments are missing or unexpected, or when some other error occurs the serializer should throw an error or reject a promise
- Any number of supported countries could be added in the future to this serializer library and can have uncanny formats. Can you find some common axioms?

# Details
## Nova's serialized format


Our common Nova serialized format consists of a year followed by a tilde, then the year's payments. Each digit is one separate payment. Every `year~payments` structure is pipe-delimited. Example given:
```
2013~000032222222|2012~222225432222|2011~222220000000
```

It is in decreasing order on the year and the payments: the first value in the payment string is the last month in the corresponding year.
The payment string digits have integer codes ranging from 0 to 7 (including), with the following meaning:

- 0: No record for this time period
- 1: Recorded payment but details N/A
- 2: Paid on time
- 3: <= 30 days late
- 4: <= 60 days late
- 5: <= 90 days late
- 6: <= 120 days late
- 7: > 120 days late

The rules we define on our serialized format:
1. All payment values indicate the last day of the respective month in that year. I.e a payment fell in January 3rd of 2014, the resulting payment value would be serialized the same as if the payment happened on January 25th 2014, which is the first month 2014.
2. The string always has 12 integer codes.

## India

Country code: `IND`

The format of our data supplier in India is defined as
```
Mar:2013,164/LOS|Feb:2013,134/LOS|Jan:2013,106/LOS|...|Jun:2010,000/STD|May:2010,000/STD|Apr:2010,000/STD|
```
It is a big pipe-delimited string with the first three character defining the month, followed by the year.
After the date information structured as `Mmm:yyyy,` an integer follows which is the number of days late on a particular due payment. The last three letters are asset-classifications which are irrelevant for our parsing so you can discard them.

## Other countries

Country code: according to ISO 3166-1 alpha-3 standard.

Every country has a different string format that Nova has to serialize. The output is always of the same structure, namely the Nova serialized format. Due to the similar signature and some countries that are more or less the same in payment-history format we're bettor off to create a library that's flexible to every country's payment-history format.

# Misc
## Examples

Some examples of Mexican payment-histories that get parsed to the correct Nova format:

```
inputs:
'May:2007,XXX/XXX|Apr:2007,XXX/XXX|Mar:2007,XXX/XXX|Feb:2007,XXX/XXX|Jan:2007,XXX/XXX|Dec:2006,XXX/XXX|Nov:2006,XXX/XXX|Oct:2006,XXX/XXX|Sep:2006,XXX/XXX|Aug:2006,XXX/XXX|Jul:2006,XXX/XXX|Jun:2006,XXX/XXX|May:2006,XXX/XXX|Apr:2006,XXX/XXX|Mar:2006,XXX/XXX|Feb:2006,XXX/XXX|'

output:
'2007~000000011111|2006~111111111110'
```

```
inputs:
'Feb:2013,900/XXX|Jan:2013,900/XXX|Dec:2012,DDD/DDD|Nov:2012,880/XXX|Oct:2012,850/XXX|Sep:2012,000/XXX|Aug:2012,758/XXX|Jul:2012,727/XXX|Jun:2012,697/XXX|May:2012,DDD/DDD|Apr:2012,DDD/DDD|Mar:2012,636/XXX|Feb:2012,605/XXX|Jan:2012,576/XXX|Dec:2011,545/XXX|Nov:2011,514/XXX|Oct:2011,484/XXX|Sep:2011,DDD/DDD|Aug:2011,423/XXX|Jul:2011,392/XXX|Jun:2011,361/XXX|May:2011,331/XXX|Apr:2011,300/XXX|Mar:2011,270/XXX|Feb:2011,239/XXX|Jan:2011,211/XXX|Dec:2010,118/XXX|Nov:2010,119/XXX|Oct:2010,088/XXX|Sep:2010,088/XXX|Aug:2010,088/XXX|Jul:2010,087/XXX|Jun:2010,DDD/DDD|May:2010,XXX/XXX|Apr:2010,XXX/XXX|Mar:2010,XXX/XXX|'

output:
'2013~000000000077|2012~177277711777|2011~777177777777|2010~665555111100'
```

```
inputs:
// invalid payment string, missing a pipe-delimiter
'Mar:2013,664/LOSFeb:2013,634/LOS|Jan:2013,606/LOS|Dec:2012,575/LOS|Nov:2012,544/LOS|Oct:2012,514/LOS|Sep:2012,482/LOS|Aug:2012,453/LOS|Jul:2012,422/LOS|Jun:2012,391/LOS|May:2012,361/LOS|Apr:2012,330/LOS|Mar:2012,300/LOS|Feb:2012,269/LOS|Jan:2012,240/LOS|Dec:2011,209/LOS|Nov:2011,178/SUB|Oct:2011,148/SUB|Sep:2011,117/SUB|Aug:2011,087/STD|Jul:2011,055/STD|Jun:2011,025/STD|May:2011,026/STD|Apr:2011,025/STD|Mar:2011,026/STD|Feb:2011,000/STD|Jan:2011,000/STD|Dec:2010,000/STD|Nov:2010,000/STD|Oct:2010,025/STD|Sep:2010,025/STD|Aug:2010,026/STD|Jul:2010,000/STD|Jun:2010,000/STD|May:2010,000/STD|Apr:2010,000/STD|'

output:
<rejected Promise> or undefined
```

## Grading criteria
- Structure used for abstraction and the amount of abstraction
- Whether it passes our internal tests according to the guidelines in this README.md. You can write your own tests in the provided `test` directory to make sure the rules outlined in this guide are met if you prefer.

## Hints
- The `moment` package is your biggest friend ;)
