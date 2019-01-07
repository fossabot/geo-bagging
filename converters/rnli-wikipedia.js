const fs = require('fs');
const wtfWikipedia = require("wtf_wikipedia");
const ifCmd = require('./utils').doIfCmdCall;
const constants = require('./constants');
require('global-tunnel-ng').initialize();
const inputDir = `${constants.tmpInputDir}/rnli`;

function fetchWikiData() {
	return new Promise((resolve, reject) => {
		wtfWikipedia.fetch("List_of_RNLI_stations", "en", function(err, doc){
			let stations = doc.tables().reduce((allStations, division) => {
				let divisionStations = division.json().map(station => {
					let typesString = station['Lifeboat type(s)'].text;
					let launchString = station['Launch method'].text;
					let types = parseTypes(typesString)
					let launchMethods = parseLaunchMethods(launchString)
					let name = parseStation(station['Station'].text)
					return {
						types,
						name,
						launchMethods
					}
				})
				return allStations.concat(divisionStations)
			}, []).reduce((stationsByName, station) => {
				stationsByName[station.name] = {
					types: station.types,
					launchMethods: station.launchMethods
				}
				return stationsByName
			}, {});
			
			let stationsString = JSON.stringify(stations, null, 2);
			fs.writeFile(`${inputDir}/wiki.json`, stationsString, function(err) {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			}); 
			
		});
	});
}

function parseStation(stationText) {
	if (/{{Lbs\|(.*)}}/.test(stationText)) {
		stationText = stationText.match(/{{Lbs\|(.*)}}/)[1]
	}
	
	// just some basic but very specific replacements to make it match up with the rnli data
	let replacements = [
		["Berwick-upon-Tweed", "Berwick Upon Tweed"],
		["Dún Laoghaire", "Dun Laoghaire"],
		["Saint Peter Port", "St Peter Port"],
		["Red Bay", "Red bay"],
		["Wells-next-the-Sea", "Wells"]
	];
    return replace(stationText, replacements).trim().toLowerCase()
}

function parseTypes(typesString) {
	let replacements = [
		['Atlantic 75', 'Atlantic75'],
		['Atlantic 85', 'Atlantic85'],
		['Shannon class 13-06 RNLB', 'Shannon'],
		['Shannon Class', 'Shannon'],
		['Arancia IRB \\(A-76\\)', 'Arancia'],
		['Tamar-class', 'Tamar'],
		['Tyne-class', 'Tyne'],
		['H\\-class', 'H'],
		['E\\-class', 'E'],
		['D\\-class \\(1B1\\)', 'D'],
		['D\\-class \\(IB1\\)', 'D'],
		['D\\-class', 'D']		
	];
    return multiReplace(typesString, replacements)
}

function parseLaunchMethods(launchString) {
    let replacements = [
        ['W\\.E\\.F\\. 8 December 2014', ''], //I have no idea what this is
        ['Moored afloat', 'MooredAfloat'],
        ['Floating cradle', 'FloatingCradle'],
        ['Floating house', 'FloatingHouse'],
        ['Moored alongside', 'MooredAfloat'],
        ['Mobile davit', 'Transporter'],
        ['Carriageway', 'Carriage']
    ]
    return multiReplace(launchString, replacements)
}

function multiReplace(input, replacements) {
	let things = replace(input, replacements).split(/\s+/)
	let uniqueThings = new Set(things)
	return [...uniqueThings]
}

function replace(input, replacements) {
    return replacements.reduce((result, [regex, replacement]) =>
        result.replace(new RegExp(regex, 'gi'), replacement)
    , input).trim()
}

ifCmd(module, fetchWikiData)

module.exports.fetchWikiData = fetchWikiData;
