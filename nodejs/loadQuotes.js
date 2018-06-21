// DEPENDENCIE ==> npm install firebase-admin --save
//
// DEPENDENCIE ==> npm install node-fetch --save
//          https://www.npmjs.com/package/node-fetch
"use strict";

const admin = require("firebase-admin");
const fetch = require("node-fetch");
const serviceAccount = require("./../data/my-firebase-adminsdk.json");

const usd = 'USD';
let quotes = {};            // TODO: create a class to set/get quotes

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-currency-community.firebaseio.com"
});

/* Sample quote object formated:
	{
		"USD": { "CAD":1.299810, "BRL":3.719599 }
		"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
		"BRL": { "USD":0.769343, "CAD":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
	}
*/
/*--
	It gets json quote object from API based on:
	(1) FROM realtime USD quotes
	(2) TO fixed currencies quotes: CAD, BRL, EUR 
*/
let initQuotes = function() {
    const web_site		= 'http://apilayer.net/api/';
    const endpoint 		= 'live'
    const access_key 	= '01daf97ed23634986ca1ce507dde70e7';
    const currencies 	= 'AUD,BRL,CAD,CLP';
    const url			= web_site + endpoint + '?access_key=' + access_key + '&currencies=' + currencies;

    console.log(url);
    fetch(url).then( response => {
        return response.json();
    })
    .then( jsonObj => {
        console.log(jsonObj);
        buildUsdQuote(jsonObj);             // Build USD quotes received from API
        buildOthersQuotes();                // Format others exchange rates
        
        admin.database().ref('quotes/').set(quotes);
    })
    .catch( err => {
        console.log("error calling apilayer:" + err.message);
    });
};

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
};

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
};

initQuotes();