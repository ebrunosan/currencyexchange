/* 
	Author: 		Bruno Santos
	Date:			2018-06-04
	Version: 		2.0
	Description:	1) authenticates users at Firebase 	
					2) Formats money exchange card based on Firebase quotes
					
*/

"use strict";
/*--
	It fills the html user card
	(1) picture, Name, email, and phone
*/
let fillUserCard = function( userObj ) {
    $( "#user-picture" ).css( 'background-image' , 'url(' + userObj.photoURL + ')');
    $( "#user-name" ).text( userObj.displayName );
    $( "#user_info" ).html( `${ userObj.email }<br>Phone: ${ userObj.phone }` );
}

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
}


/*--
	It is a Firebase event handler to check authentication changes
	(1) get authenticated user info and users information
*/
firebase.auth().onAuthStateChanged(function( user ) {
    let dialog = document.querySelector( "#login-dialog" );

    if ( user ) {                       // User is logged in
        let user = firebase.auth().currentUser;

        $( ".login-cover" ).hide();     // Hide login dialog
        dialog.close();

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
        $( ".login-cover" ).show();     // Show login dialog
        if (! dialog.showModal) {
            dialogPolyfill.registerDialog(dialog);
        }
        dialog.showModal();
    } // end user
}); // end onAuthStateChanged

/*--
	Initializes quotes and login dialog
	(1) Sign in user using email and password on Firebase
*/
$(function() {
    $( "#cmb-country" ).change( ( evt ) => {
        var countryList = {         // TODO: try to get the value from selected element
          'Australia'   : 'AUD',
          'Brazil'      : 'BRL',
          'Canada'      : 'CAD',
          'Chile'       : 'CLP',
          'USA'         : 'USD',
        };

        let country = $('#cmb-country').val();
        
		const url = `https://my-currency-community.firebaseio.com/users.json?orderBy="nat_withdraw"&equalTo="${ countryList[country] }"&print=pretty`;
		
        fetch(url).then( response => {
            return response.json();
        }).then( data => {
            $('#user-email').val('');           // clear user email if previous selected
            $('#cmb-user-email li').remove();   // clear previous li's added elements
            for(let user in data) {
                // Ignore non-valid emails
                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test( data[user].email ) ) {
                    $('#cmb-user-email').append(    // append emails from filtered search
                        `<li class="mdl-menu__item" data-val="${ data[user].email }">${ data[user].email }</li>`
                    );
                }
            }

            // IMPORTANT: in order to "refresh" Material Design Lite 
            getmdlSelect.init('#div-user-email');

        }).catch( err => {
            console.log("Error filtering users from Firebase");
        }); // END filtered users 
    });

    
    $( "#btn-users-country" ).click( ( evt ) => {
        let path = location.pathname;
        location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + 'users-country.html';
    });

    $( "#btn-login" ).click( ( evt ) => {   // LOGIN
        let email = $( "#user-email" ).val();
        let pswd = $( "#user-pswd" ).val();

        $( "#login-progress" ).show();
        $( "#btn-login" ).hide();

        firebase.auth().signInWithEmailAndPassword( email, pswd ).catch( function( error ) {
            $( "#msgLoginError" ).show().text( error.message );
            $( "#login-progress" ).hide();
            $( "#btn-login" ).show();
        });
        
        $( "#login-progress" ).hide();
        $( "#btn-login" ).show();
    }); // end click

    $( "#btn-logout" ).click( ( evt ) => {          // LOGOUT
        firebase.auth().signOut().then( function() {
          console.log( "logout successful" )
        })
        .catch( function( error ) {
          // TODO: Handle Errors here.
          console.log(`${ error.code } - ${ error.message }`);
        });
    }); // end click
}); // document ready