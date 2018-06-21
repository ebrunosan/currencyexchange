/* 
	Author: 		Bruno Santos
	Date:			2018-06-20
	Version: 		1.0
	Description:	1) authenticates users at Firebase 	
					2) Formats money exchange card based on Firebase quotes
					
*/

"use strict";
/*--
	It fills the html user card
	(1) picture, Name, email, and phone
*/
let fillUserCard = function( userObj ) {
//    $( "#user-picture" ).css( 'background-image' , 'url(' + userObj.photoURL + ')');
//    $( "#user-name" ).text( userObj.displayName );
//    $( "#user_info" ).html( `${ userObj.email }<br>Phone: ${ userObj.phone }` );
}

/*--
	It fills the html transfer card
	(1) flag, quote, value to withdraw/transfer, total current value to transfer
*/
let fillTransferCard = function( userObj, quotes) {
//    // TODO: create CARD html 'Transfer' for each obj in database
//
//    let quote = quotes[ userObj.nat_withdraw ][ userObj.nat_deposit ];
//    let totalDep = ( quote * userObj.tot_withdraw ).toFixed(2);
//    let transferTitle = `From ${ userObj.nat_withdraw } to ${ userObj.nat_deposit }`;
//
//    let transferDetails = `${ userObj.nat_withdraw } $ ${ userObj.tot_withdraw } <br />`;
//    transferDetails += `Quote for 1 ${ userObj.nat_withdraw } is ${ quote } ${ userObj.nat_deposit } <br />`;
//    transferDetails += `<strong>Total ${ userObj.nat_deposit } $ ${ totalDep }</strong>`;
//
//    $( "#transfer-flag" ).attr( 'src', `./image/${ userObj.nat_deposit }.svg`);
//    $( "#transfer-title" ).text( transferTitle );
//    $( "#transfer-details" ).html( transferDetails );
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
            firebase.database().ref( '/users/' + user.uid ).once( 'value' ).then( function( snapshot ) {
                let userObj = snapshot.val();
                
                Quotes.existValidQuotes().then( ( quotes ) => {
                    fillUserCard( userObj );
                    fillTransferCard( userObj, quotes );
                });
            });
        } //end user not null
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