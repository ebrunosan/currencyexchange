/* 
	Author: 		Bruno Santos
	Date:			2018-06-16
	Version: 		1.0
	Description:	1) Get realtime currency quotes based on API call
					2) Provides currency exchange conversion
					3) Formats money exchange card based on users values
					
					API documentation: https://currencylayer.com/documentation
                    
    TTL reference   http://www.brianchildress.co/posts/Giving-Storage-a-Time-To-Live/
*/

"use strict";
const C_USD = 'USD';
const C_EXPIRATION_TIME = 60000 * 10;       // 10 minutes 

//const web_site		= 'https://crossorigin.me/http://apilayer.net/api/';
const web_site		= 'http://apilayer.net/api/';
const endpoint 		= 'live'
const access_key 	= '01daf97ed23634986ca1ce507dde70e7';
const currencies 	= 'AUD,BRL,CAD,CLP';
const url			= web_site + endpoint + '?access_key=' + access_key + '&currencies=' + currencies;

class LocalItem {
    
    static setLocalItem( key, value, time ) {
        // If time was not defined, set time to 0. 0 is considered infinite so 
        // these items will persist

        time = time || 0;

        // Generate a timestamp for the item
        let timestamp = this.setTimeToLive(time);

        // Set up the storage item by creating a simple object that will be 
        // stringified
        let storageObj = {
            'timestamp': timestamp,
            'value': value
        };

        return localStorage.setItem(key, JSON.stringify(storageObj));
    }

    static setTimeToLive( lifespan ) {
        let currentTime = new Date().getTime();
        
        let timeToLive;

        if (lifespan !== 0) {
            timeToLive = currentTime + lifespan;
        } else {
            timeToLive = 0; // Lifespan is now infinite and dependent only browser
        }

        return timeToLive;
    }

    static getLocalItem( key ) {
        let item = JSON.parse( localStorage.getItem(key) );

        if ( item ) { // If item exists evaluate, else return
            
            if ( this.evaluateTimeToLive(item.timestamp) ) {
                return JSON.parse( item.value );
            } else {
                this.removeLocalItem(key);
                return {};
            }
        } else {
            return {};
        }
    }

    static evaluateTimeToLive( timestamp ) {
        let currentTime = new Date().getTime();

        if (currentTime <= timestamp || timestamp === 0) {
            return true;
        } else {
            return false;
        }
    }

    static removeLocalItem( key ) {
        return localStorage.removeItem(key);
    }
}

/* Sample quote object formated:
	{
		"USD": { "CAD":1.299810, "BRL":3.719599 }
		"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
		"BRL": { "USD":0.769343, "CAD":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
	}
*/
class Quotes {
    
    static getQuote( from, to ) {
        this.existValidQuotes();
        return this.quotes[from][to];
    }
    
    static getQuotes( from ) {
        this.existValidQuotes();
        return this.quotes[from];
    };
    
    static existValidQuotes() {
        if (this.quotes) return;
        
        this.quotes = LocalItem.getLocalItem( "quotes" );
        
        if( Object.keys(this.quotes).length == 0 ) {                    // check if there is data on localStorade
            this.renewQuote();
            LocalItem.setLocalItem( "quotes", JSON.stringify(this.quotes), C_EXPIRATION_TIME );  
        }
    }

    static renewQuote() {
        fetch(url).then( response => {
            return response.json();
        })
        .then( jsonObj => {
//        let jsonObj = {"success":true, "terms":"https:\/\/currencylayer.com\/terms", "privacy":"https:\/\/currencylayer.com\/privacy", "timestamp":1529208728, "source":"USD", "quotes":{"USDAUD":1.343604, "USDBRL":3.729804, "USDCAD":1.319904, "USDCLP":632.469971}};
        
            console.log(jsonObj);
            this.buildUsdQuote(jsonObj);        // Build USD quotes received from API
            this.buildOthersQuotes();           // Format others exchange rates
        })
        .catch( err => {
            console.log("error calling apilayer");
        });
    }
    
    /* It split and build a json quote object based on:
       (1) USD quotes from API
    */
    static buildUsdQuote( jsonObj ) {
        // Original: "quotes":{"USDCAD":1.29981,"USDBRL":3.719599,"USDUSD":1}
        let newObj = {};
        for (let key in jsonObj.quotes) {
            if (key.substr(3,3) !== C_USD) {
                newObj[key.substr(3,3)] = jsonObj.quotes[key];
            }
        }
        // Expected: quotes["USD"] = { "CAD":1.29981, "BRL":3.719599 }	
        this.setQuoteObj(C_USD, newObj);
    }
    
    /* It calculater others quotes based on:
       (1) USD quotes from json object
    */
    static buildOthersQuotes() {
        let newObj, fromSymbol, fromRate;

        for ( let symbol in this.getQuotes(C_USD) ) {			// forEach USD currency
            newObj = {};							// clear Obj

            fromSymbol = symbol;
            fromRate = this.getQuote(C_USD, symbol);

            // convert to USD exchange rate to 6 decimal places
            newObj[C_USD] = parseFloat( (1 / fromRate).toFixed(6) );

            for ( let symbolLoop in this.getQuotes(C_USD) ) {	// forEach USD currency AGAIN
                if (symbolLoop !== symbol) {		// Others currency exchange
                    newObj[symbolLoop] = parseFloat( 
                        ( newObj[C_USD] * this.getQuote(C_USD, symbolLoop) ).toFixed(6) );
                } // if
            } // for
            this.setQuoteObj(fromSymbol, newObj);
        } // for ext
    };
    
    static setQuoteObj( from, obj ) {
        this.quotes[from] = obj;
    }
    
    static setQuoteRate( from, to, rate ) {
        return this.quotes[from][to] = rate;
    }

} // class
