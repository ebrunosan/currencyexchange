"use strict";
let $ = function (id) {
    return document.getElementById(id);
}

const usd 			= 'USD';

const web_site		= 'http://apilayer.net/api/';
const endpoint 		= 'live'
const access_key 	= '01daf97ed23634986ca1ce507dde70e7';
const currencies 	= 'CAD,BRL,EUR';

const url			= web_site + endpoint + '?access_key=' + access_key + '&currencies=' + currencies;

//console.log(url);

// ORIGINAL json
let jsonObj = {
	"success":true,
	"terms":"https:\/\/currencylayer.com\/terms",
	"privacy":"https:\/\/currencylayer.com\/privacy",
	"timestamp":1527529154,
	"source":"USD",
	"quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
}

// CONVERTED json
let quotes = {};
/* 
	{"USD": { "CAD":1.29981, "BRL":3.719599 }
	"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
	"BRL": { "USD":0.769343, "CAD":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
	}
*/

let parseUsdQuote = function() {
	// Original: "quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
	let newObj = {};
	for (let key in jsonObj.quotes) {
		if (key.substr(3,3) !== usd) {
			newObj[key.substr(3,3)] = jsonObj.quotes[key];
		}
	}
	// Expected: quotes["USD"] = { "CAD":1.29981, "BRL":3.719599 }	
	quotes[usd] = newObj;
	
	parseOthersQuotes();							// Format others exchange rates
}

let parseOthersQuotes = function() {
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
	
	initCombos();								// Botch combos FROM and TO
}

let initCombos = function() {
	// set Default option
	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose';

	let cmbFrom = $("currency_from");
	cmbFrom.length = 0;
	let cloneNode = defaultOption.cloneNode(true)
	cmbFrom.add(defaultOption);
	cmbFrom.selectedIndex = 0;

	let option;
	for (let symbol in quotes) {
		option = document.createElement('option');
		option.text = symbol;
		option.value = symbol;
		cmbFrom.add(option);
	}	
}

let refreshCmbTo = function() {
	let currencyFrom = $("currency_from").value;
	
	// set Default option
	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose';

	let cmbTo = $("currency_to");
	cmbTo.length = 0;
	cmbTo.add(defaultOption);
	cmbTo.selectedIndex = 0;
	
	let option;
	for (let symbol in quotes[currencyFrom]) {
		option = document.createElement('option');
		option.text = symbol;
		option.value = quotes[currencyFrom][symbol];
		console.log(option);
		cmbTo.add(option);
	}
}

let refreshAmountTo = function() {
	// TODO
	// not working console.log($("currency_to").selected);
	$("amount_to").innerHTML = ("1 " 
				+ $("currency_from").value 
				+ " = " + $("currency_to").value 
				+ " " + $("currency_to").text);
	//console.log("1 " + $("currency_from").value + " = " $("currency_to").value + " " + $("currency_to"));
}


window.onload = function () {
    $("currency_from").onchange = refreshCmbTo;
    $("currency_to").onchange = refreshAmountTo;
	parseUsdQuote();
}