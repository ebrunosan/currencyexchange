/* 
	Author: 		Bruno Santos
	Date:			2018-06-20
	Version: 		2.0
	Description:	1) Get currency quotes based on Firebase DB
					
    TTL reference   http://www.brianchildress.co/posts/Giving-Storage-a-Time-To-Live/
*/

"use strict";
const C_EXPIRATION_TIME = 60000 * 30;       // 30 minutes 
const C_URL = 'https://my-currency-community.firebaseio.com/quotes.json';


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
    
//    static getQuote( from, to ) {
//        this.existValidQuotes().then( (quotes) => {
//            return quotes[from][to];
//        });
//    }
//    
//    static getQuotes( from ) {
//        this.existValidQuotes().then( (quotes) => {
//            return quotes[from];
//        });
//    }

    static async existValidQuotes() {
        if ( !this.quotes ) { 
            this.quotes = LocalItem.getLocalItem( "quotes" );

            if( Object.keys(this.quotes).length == 0 ) {    // check if there is data on localStorade
                let response = await fetch( C_URL );
                this.quotes = await response.json();
                LocalItem.setLocalItem( "quotes", JSON.stringify( this.quotes ), C_EXPIRATION_TIME );  
            }
        }

        return Promise.resolve(this.quotes);
    }
    
} // class
