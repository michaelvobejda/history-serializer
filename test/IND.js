/* global define, it, describe, beforeEach, afterEach */
import constants from '../build/constants';
import createHistorySerializer from '../src/index.js';

var should = require('should');

describe('Payment History Serializer', () => {

	var test1 = createHistorySerializer(constants.india);
	describe('India', () => {

		it('properly sets country code', () => {
			test1.code.should.equal("IND");
		});

		it('properly sets original', () => {
			test1.original.should.equal(constants.india);
		});

		it('correctly serializes history', () => {
			test1.nova.should.equal(constants.indiaNova);
		});
	});

	describe('Unknown format', () => {

		it('should throw error', () => {
			should(function() { createHistorySerializer(constants.unknown); }).throw();
		});
	});

	var test2 = createHistorySerializer(constants.mexico1);
	describe('Mexico1', () => {

		it('properly sets country code', () => {
			test2.code.should.equal("IND");
		});

		it('properly sets original', () => {
			test2.original.should.equal(constants.mexico1);
		});

		it('correctly serializes history', () => {
			test2.nova.should.equal(constants.mexico1Nova);
		});
	});

	var test3 = createHistorySerializer(constants.mexico2);
	describe('Mexico2', () => {

		it('properly sets country code', () => {
			test3.code.should.equal("IND");
		});

		it('properly sets original', () => {
			test3.original.should.equal(constants.mexico2);
		});

		it('correctly serializes history', () => {
			test3.nova.should.equal(constants.mexico2Nova);
		});
	});

	describe('Mexico3 (malformed)', () => {

		it('should throw error', () => {
			should(function() { createHistorySerializer(constants.mexico3); }).throw();
		});
	});
});
