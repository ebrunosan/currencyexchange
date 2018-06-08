/* 
	Author: 		Bruno Santos
	Date:			2018-05-29
	Version: 		1.0
	Description:	1) Get realtime currency quotes based on API call
					2) Provides currency exchange conversion
					
					API documentation: https://currencylayer.com/documentation
*/

"use strict";
let $ = function (id) {
    return document.getElementById(id);
}

const usd = 'USD';

/* Sample quote object formated:
	{
		"USD": { "CAD":1.299810, "BRL":3.719599 }
		"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
		"BRL": { "USD":0.769343, "CAD":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
	}
*/
let quotes = {};

/*--
	It gets json quote object from API based on:
	(1) FROM realtime USD quotes
	(2) TO fixed currencies quotes: CAD, BRL, EUR 
*/
let initQuotes = function() {
	const web_site		= 'http://apilayer.net/api/';
	const endpoint 		= 'live'
	const access_key 	= '01daf97ed23634986ca1ce507dde70e7';
	const currencies 	= 'CAD,BRL,EUR';
	const url			= web_site + endpoint + '?access_key=' + access_key + '&currencies=' + currencies;

	// ORIGINAL CALL FOR FETCHING API's DATA
	// ORIGINAL CALL FOR FETCHING API's DATA
	// ORIGINAL CALL FOR FETCHING API's DATA
	/*
	console.log(url);
	fetch(url)
		.then( response => {
			return response.json();
		})
		.then( jsonObj => {
			console.log(jsonObj);
			buildUsdQuote(jsonObj);		// Build USD quotes received from API
			buildOthersQuotes();		// Format others exchange rates
			initOptionsFrom();			// Populate options at combo box FROM
		})
		.catch( err => {
			console.log("error");
		});
	// ORIGINAL CALL FOR FETCHING API's DATA
	// ORIGINAL CALL FOR FETCHING API's DATA
	// ORIGINAL CALL FOR FETCHING API's DATA
	*/

	// json USED FOR TEST PURPOSE ONLY
	// json USED FOR TEST PURPOSE ONLY
	// json USED FOR TEST PURPOSE ONLY
	let jsonObj = {		
		"success":true,
		"terms":"https:\/\/currencylayer.com\/terms",
		"privacy":"https:\/\/currencylayer.com\/privacy",
		"timestamp":1527601750,"source":"USD",
		"quotes":{
			"USDCAD":1.302197,
			"USDBRL":3.723399,
			"USDEUR":0.863499
		}
	}
	buildUsdQuote(jsonObj);				// Build USD quotes received from API
	buildOthersQuotes();				// Format others exchange rates
	initOptionsFrom();					// Populate options at combo box FROM
	// json USED FOR TEST PURPOSE ONLY
	// json USED FOR TEST PURPOSE ONLY
	// json USED FOR TEST PURPOSE ONLY
}

/*--
	It split and build a json quote object based on:
	(1) USD quotes from API
*/
let buildUsdQuote = function(jsonObj) {
	// Original: "quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
	let newObj = {};
	for (let key in jsonObj.quotes) {
		if (key.substr(3,3) !== usd) {
			newObj[key.substr(3,3)] = jsonObj.quotes[key];
		}
	}
	// Expected: quotes["USD"] = { "CAD":1.29981, "BRL":3.719599 }	
	quotes[usd] = newObj;
}

/*--
	It calculater others quotes based on:
	(1) USD quotes from json object
*/
let buildOthersQuotes = function() {
	let newObj, fromSymbol, fromRate;
	
	for (let symbol in quotes[usd]) {			// forEach USD currency
		newObj = {};							// clear Obj

		fromSymbol = symbol;
		fromRate = quotes[usd][symbol];

		// convert to USD exchange rate to 6 decimal places
		newObj[usd] = parseFloat((1 / quotes[usd][symbol]).toFixed(6));

		for (let symbolLoop in quotes[usd]) {	// forEach USD currency AGAIN
			if (symbolLoop !== symbol) {		// Others currency exchange
				newObj[symbolLoop] = parseFloat((newObj[usd] * 
									quotes[usd][symbolLoop]).toFixed(6));
			}
		}
		quotes[fromSymbol] = newObj;
	}	
}

/*--
	It populates combo FROM based on:
	(1) json object quotes
*/
let initOptionsFrom = function() {
	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose';

	let cmbFrom = $("currency_from");
	cmbFrom.length = 0;
	cmbFrom.add(defaultOption);			// set default option
	cmbFrom.selectedIndex = 0;

	let option;
	for (let symbol in quotes) {		// Populates symbols
		option = document.createElement('option');
		option.text = symbol;
		option.value = symbol;
		cmbFrom.add(option);
	}	
}

/*--
	It populates combo TO based on:
	(1) selected combo FROM 
	(2) json object quotes
*/
let refreshCmbTo = function() {
	$("amount_to").innerHTML = "";		// Clear amount TO
	let selectedFrom = $("currency_from").value;
	
	let defaultOption = document.createElement('option');
	defaultOption.text = 'Choose';
	
	let cmbTo = $("currency_to");
	cmbTo.length = 0;
	cmbTo.add(defaultOption);			// set default option
	cmbTo.selectedIndex = 0;
	
	let option;							// Populates symbols and quotes
	for (let symbol in quotes[selectedFrom]) {
		option = document.createElement('option');
		option.text = symbol;
		option.value = quotes[selectedFrom][symbol];
		cmbTo.add(option);
	}
}

/*--
	It converts the amount FROM -> TO based on:
	(1) input amount FROM 
	(2) combo currency FROM
	(3) combo currency TO
*/
let refreshAmountTo = function() {
	// When no selection , skip convertion & clear 
	if ( isNaN($("currency_to").value) ) {
		$("amount_to").innerHTML = "";
		return;
	}

	// Convert currency amount FROM -> TO
	let amountFrom = parseFloat( $("amount_from").value );
	let amountTo = amountFrom * parseFloat( $("currency_to").value );

	// Format and display converted values
	$("amount_from").value = amountFrom.toFixed(2);
	$("amount_to").innerHTML = ( amountFrom.toFixed(2) + " " 
				+ $("currency_from").value + " = " 
				+ amountTo.toFixed(2) + " " 
				+ $("currency_to").options[ $("currency_to").selectedIndex ].text );
}

window.onload = function () {
    $("currency_from").onchange = refreshCmbTo;
    $("currency_to").onchange = refreshAmountTo;
    $("amount_from").onchange = refreshAmountTo;
	initQuotes();
}