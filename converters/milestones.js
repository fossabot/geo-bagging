const fs = require('fs');
const xlsx = require('xlsx');
const CombinedStream = require('combined-stream2');
const stream = require('stream');

const Converter = require('./converter');

const inputDir = 'milestones-input';

const attributionString = "This file adapted from the the database of 'The Milestone Society' (http://www.milestonesociety.co.uk/database.html).";
const columnHeaders = "[Type,National_ID,Grid_Reference,Category]"

class WaypointsConverter extends Converter {
	constructor() {
		super(attributionString, columnHeaders);
	}
	
	extractColumns(record) {
		if (record.length > 1) {
			return [
				record[0], //type based on source file
				record[1], //National_ID
				record[5], //Grid_Reference
				record[11] //Category
			];
		} else {
			return null;
		}
	}
	
	_streamString(str) {
		var s = new stream.Readable();
		s.push(str);
		s.push('\n');
		s.push(null);
		return s;
	}
	
	_extractType(fileName) {
		if (fileName.startsWith('MSS_Summary_Sheet_Milestones')) {
			return 'Milestones';
		} else {
			var match = /MSS_Summary_Sheet_(.*)\.xls/.exec(fileName);
			return match[1];
		}
	}

	_readSheet(fileName) {
		var type = this._extractType(fileName);
		var workbook = xlsx.readFile(inputDir + '/' + fileName);
		var sheets = Object.keys(workbook.Sheets).filter(sheet => !/^Sheet\d$/.test(sheet));
		if (sheets.length > 1) {
			throw new Error(`We only know how to deal with a single sheet of data: ${sheets}`);
		}
		if (sheets.length == 0) {
			sheets = ['Sheet1']; //Milesmarkers (at least) doesn't name its sheets
		}
		var str = xlsx.utils.sheet_to_csv(workbook.Sheets[sheets[0]]);
		//remove first line
		var body = str.substring(str.indexOf('\n') + 1, str.length)
		if (body.endsWith('\n')) {
			body = body.substring(0, body.length - 1);
		}
		body = body.replace(/\n/g, '\n' + type + ',');
		body = type + ',' + body;
		return this._streamString(body);
	}
	
	writeOut2(inputs, output) {
		var combinedStream = CombinedStream.create();
		inputs.forEach(input => combinedStream.append(this._readSheet(input)));
		this.writeOutStream(combinedStream, output);
	}
}

fs.readdir(inputDir, (err, files) => {
	(new WaypointsConverter()).writeOut2(files, '../js/bundles/milestones/data.json');
})

