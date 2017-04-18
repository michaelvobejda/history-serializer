/*
 Implementation of a generalized history serializer. Exports a single factory function that returns a serializer that uses a payment history 
 string to auto-configure to a country format. The serializer stores the country code, the original payment history, and Nova's serialized format.
 This file can be updated to include additional country formats by adding a new countryFormat object to the countryFormats array.
 */

'use strict';

var moment = require('moment');


// Object for encapsulating formatting information for easy expansion to new countries
function countryFormat(code, regex, dataRegex, date) {
	this.code = code; // ISO 3166-1 alpha-3 standard
	this.regex = regex; // regular expression to match time period format in history string
	this.dataRegex = dataRegex; // regular expression to match relevant data in time period
	this.date = date; // date format recognized by moment.js, e.g. MMM:YYYY
}


// Array for country formats -- to add a country, simply add new countryFormat object to this array
var countryFormats = [
	new countryFormat("IND", /^\D{3}:\d{4},\w{3}\/\w{3}\|/, /,\w{3}\//, "MMM:YYYY") // India

	// add more countries here

];


// Exported factory function that returns serializer given payment history string
export default function createHistorySerializer(history) {
  var serializer = new Object();
  serializer.original = history;
  var format = determineFormat(history);
  serializer.code = format.code;
  serializer.nova = serializeHistory(format, history);
  return serializer;
}


// Helper function that assigns format to serializer based on history
function determineFormat(history) {
  var firstPeriod = history.slice(0, history.indexOf('|')+1); // assuming all formats use | to delimit payment periods
  for (var i = 0; i < countryFormats.length; i++) {
    var format = countryFormats[i];
    if (firstPeriod.search(format.regex) != -1) { // only check first period for efficiency, then thoroughly check entire string if match
    	var periods = history.split('|');
    	var matches = true;
    	for (var j = 1; j < periods.length-1; j++) {
    		var period = periods[j] + '|'; // somewhat hacky (but I suspect most efficient) way to have regex still match after split removes delim
    		if (period.search(format.regex) == -1 || !moment(period, format.date).isValid()) {
    			matches = false;
    			break;
    		}
    	}
      if (matches) return format; // reached when every period in history string has been checked against regex and moment format
    }
  }
  throw new Error("Unknown payment-history string format."); // reached when list of formats is exhausted, meaning either malformed or unknown input
}


// Takes countryFormat and payment history string and returns Nova's serialized format
function serializeHistory(format, history) {
	var nova = "";
	var periods = history.split('|');
	var year = 0;
	var month = 11;
	for (var i = 0; i < periods.length-1; i++) { // iterate through each payment period (ignore last index containing delim)
		var period = periods[i];
		var date = moment(period, format.date);
		if (date.year() != year) { 
			if (year != 0) nova += '|'; 
			year = date.year();
			nova += date.year().toString() + '~';
			month = 11;
		}
		while (date.month() != month) { // add 0's for missing payment periods
			nova += "0";
			month--;
			if (month < 0) month = 11;
		}
		var data = period.match(format.dataRegex);
		if (data == null) throw new Error("Incorrect dataRegex for country format entry.");
		nova += getPaymentCode(data[0].slice(1, -1)); // remove delims on both sides from data
		month--;
	}
	while (month >= 0) { // add 0's for missing payment periods of final year
		nova += "0"; 
		month--;
	}
	return nova;
}


// Helper function that returns appropriate integer code for payment period
function getPaymentCode(daysLate) {
	daysLate = parseInt(daysLate);
	if (daysLate == 0) return "2";
	if (daysLate <= 30) return "3";
	if (daysLate <= 60) return "4";
	if (daysLate <= 90) return "5";
	if (daysLate <= 120) return "6";
	if (daysLate > 120) return "7";
	return "1";
}