"use strict";
var $ = function (id) {
    return document.getElementById(id);
}

const usd 			= 'USD';

const web_site		= 'http://apilayer.net/api/';
const endpoint 		= 'live'
const access_key 	= '01daf97ed23634986ca1ce507dde70e7';
const currencies 	= 'CAD,BRL,EUR';

const url			= web_site + endpoint + '?access_key=' + access_key + '&currencies=' + currencies;

//console.log(url);

// ORIGINAL Json
var jsonObj = {
	"success":true,
	"terms":"https:\/\/currencylayer.com\/terms",
	"privacy":"https:\/\/currencylayer.com\/privacy",
	"timestamp":1527529154,
	"source":"USD",
	"quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
}

// CONVERTED Json
var quotes = {};
/*
	"USD": { "CAD":1.29981, "BRL":3.719599 }
	"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
	"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
*/

var parseUsdQuote = function() {
	// Original quotes format: "quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
	let newObj = {};
	for (var key in jsonObj.quotes) {
		if (key.substr(3,3) !== usd) {
			newObj[key.substr(3,3)] = jsonObj.quotes[key];
		}
	}
	// Expected quotes["USD"] = { "CAD":1.29981, "BRL":3.719599 }	
	quotes[usd] = newObj;
	
	parseOthersQuotes();							// Format others exchange rates
}

var parseOthersQuotes = function() {
	let newObj;
	let fromSymbol, fromRate;
	for (let symbol in quotes[usd]) {				// forEach USD currency
		newObj = {};								// clear Obj

		fromSymbol = symbol;
		fromRate = quotes[usd][symbol];

		// convert to USD exchange rate to 6 decimal places
		newObj[usd] = parseFloat((1 / quotes[usd][symbol]).toFixed(5));

		for (let symbolLoop in quotes[usd]) {		// forEach USD currency AGAIN
			if (symbolLoop !== symbol) {			// Others currency exchange
				newObj[symbolLoop] = parseFloat((newObj[usd] * quotes[usd][symbolLoop]).toFixed(6));
			}
		}
		quotes[fromSymbol] = newObj;
	}
	console.log(quotes);
}

window.onload = function () {
    //$("calculate").onclick = processEntries;
	parseUsdQuote();
}