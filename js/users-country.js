/* 
	Author: 		Bruno Santos
	Date:			2018-06-20
	Version: 		1.0
	Description:	1) authenticates users at Firebase 	
					2) Formats money exchange card based on Firebase quotes
					
*/

"use strict";
/*--
	It fills the html transfer card
	(1) flag, quote, value to withdraw/transfer, total current value to transfer
*/
let fillTransferCard = function( userObj, quotes) {
    // TODO: create CARD html 'Transfer' for each obj in database

    let quote = quotes[ userObj.nat_withdraw ][ userObj.nat_deposit ];
    let totalDep = ( quote * userObj.tot_withdraw ).toFixed(2);
    let transferTitle = `From ${ userObj.nat_withdraw } to ${ userObj.nat_deposit }`;

    let transferDetails = `${ userObj.nat_withdraw } $ ${ userObj.tot_withdraw } <br />`;
    transferDetails += `Quote for 1 ${ userObj.nat_withdraw } is ${ quote } ${ userObj.nat_deposit } <br />`;
    transferDetails += `<strong>Total ${ userObj.nat_deposit } $ ${ totalDep }</strong>`;

    $( "#transfer-flag" ).attr( 'src', `./image/${ userObj.nat_deposit }.svg`);
    $( "#transfer-title" ).text( transferTitle );
    $( "#transfer-details" ).html( transferDetails );

    $( "#transfer-to-flag" ).attr( 'src', `./image/${ userObj.nat_withdraw }.svg`);
    $( "#transfer-to-title" ).text( `From ${ userObj.nat_deposit } to ${ userObj.nat_withdraw }` );
}

/*--	Create the type of element you pass in the parameters
*/
let createNode = function(element) {
    return document.createElement(element);
}

/*--	Append the second parameter(element) to the first one
*/
let append = function(parent, el) {
    return parent.appendChild(el);
}


let fillFilteredUsers = function( resultFilter ) {

    let badge = 1;  // TODO
    let count = 0;
    
    for(let user in resultFilter) {
        count += 1;
        let badge = resultFilter[user].badge
        let liElement = 
            `<li class="mdl-list__item mdl-list__item--two-line">`;

        liElement += 
            `<span class="mdl-list__item-primary-content">` +
                `<i  class="material-icons  mdl-list__item-avatar mdl-badge  mdl-badge--overlap"`;
        
        if (badge > 0) {
            liElement += ` data-badge="${badge}"`;
        }

        liElement += `>compare_arrows</i>` +
                `<span>${resultFilter[user].displayName}</span>` +
                `<span  class="mdl-list__item-sub-title">${resultFilter[user].nat_deposit} $ ${resultFilter[user].tot_withdraw}</span>` +
            `</span>`;

        liElement += 
            `<span  class="mdl-list__item-secondary-action" >` +
                `<label  for="switch-${count}" >` +
                    `<input  type="checkbox"  id="switch-${count}"/>` +
                `</label>` +
            `</span>`;

//        liElement += 
//            `<span  class="mdl-list__item-secondary-action" >` +
//                `<label  class="mdl-switch  mdl-js-switch  mdl-js-ripple-effect"  for="list-checkbox-${count}" >` +
//                    `<input  type="checkbox"  id="list-checkbox-${count}"  class = "mdl-switch__input" />` +
//                `</label>` +
//            `</span>`;

        liElement += `</li>`;
        
        $( '.mdl-list' ).append( liElement );
    };
    
    $('li label').addClass('mdl-switch  mdl-js-switch  mdl-js-ripple-effect');
    $('li input').addClass('mdl-switch__input');
}

let getUserDataAndList = function (user) {
    firebase.database().ref( '/users/' + user.uid ).once( 'value' ).then( function( snapshot ) {
        let userObj = snapshot.val();
        
        Quotes.existValidQuotes().then( ( quotes ) => {
            fillTransferCard( userObj, quotes );
    		const url = `https://my-currency-community.firebaseio.com/users.json?orderBy="nat_deposit"&equalTo="${userObj.nat_deposit}"&print=pretty`;
		
            fetch(url).then( response => {
                return response.json();
            }).then( data => {
//                console.log(data);
                fillFilteredUsers(data);
            }).catch( err => {
                console.log("Error filtering users from Firebase");
            }); // END filtered users 
        }); // END Quotes
    }); // END get user 

}

/*--
	It is a Firebase event handler to check authentication changes
	(1) get authenticated user info and users information
*/
firebase.auth().onAuthStateChanged(function( user ) {
    let dialog = document.querySelector( "#login-dialog" );

    if ( user ) {                       // User is logged in
        let user = firebase.auth().currentUser;

        if ( user !== null ) {
            getUserDataAndList( user );
        } else {
            console.log( "Error getting currentUser");
        }
    } else {                            // User is logged out

        let x = location.pathname;
        location.pathname = x.substring(0, x.lastIndexOf('/') + 1) + 'login.html';
    
    } // end user
}); // end onAuthStateChanged

/*--
	Initializes quotes and login dialog
	(1) Sign in user using email and password on Firebase
*/
$(function() {
    $( "#btn-home" ).click( ( evt ) => {
        let x = location.pathname;
        location.pathname = x.substring(0, x.lastIndexOf('/') + 1) + 'login.html';
    });

    $( "#btn-logout" ).click( ( evt ) => {          // LOGOUT
        firebase.auth().signOut().then( function() {
            let x = location.pathname;
            location.pathname = x.substring(0, x.lastIndexOf('/') + 1) + 'login.html';

        })
        .catch( function( error ) {
          // TODO: Handle Errors here.
          console.log(`${ error.code } - ${ error.message }`);
        });
    }); // end click
}); // document ready