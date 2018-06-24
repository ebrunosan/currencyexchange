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
    let quote = quotes[ userObj.nat_withdraw ][ userObj.nat_deposit ];
    let totalDep = ( quote * userObj.tot_withdraw ).toFixed(2);
    let transferTitle = `From ${ userObj.nat_withdraw } to ${ userObj.nat_deposit }`;

    let transferDetails = `${ userObj.nat_withdraw } $ ${ userObj.tot_withdraw } <br />`;
    transferDetails += `Quote for 1 ${ userObj.nat_withdraw } is ${ quote } ${ userObj.nat_deposit } <br />`;
    transferDetails += `<strong>Total ${ userObj.nat_deposit } $ ${ totalDep }</strong>`;

    $( "#transfer-flag" ).attr( 'src', `./image/${ userObj.nat_deposit }.svg`);
    $( "#transfer-title" ).text( transferTitle );
    $( "#transfer-details" ).html( transferDetails );

    /*  Those data are part of the second card
    *
    *   TODO: create dynamicly card only if there is data to be listed 
    */ 
    
    $( "#transfer-to-flag" ).attr( 'src', `./image/${ userObj.nat_withdraw }.svg`);
    $( "#transfer-to-title" ).text( `From ${ userObj.nat_deposit } to ${ userObj.nat_withdraw }` );
}

/*--
	It formats and add LI element to the card
	(1) the filter is NOT completely made by Firebase query
	(2) the 2 parameters ARE part of the query to filter users
	(3) TODO 1: store data to send to the next webpage after selection
	(4) TODO 2: study delete | show details of each LI elements selected by user 
*/
let fillFilteredUsers = function( resultFilter, onlyOtherUid, onlyNatWithdraw ) {
    let count = 0;          // counter for each LI element listed 
    
    for(let user in resultFilter) {
        /* QUERY DEFINITION: 
            -> list users who wants to deposit at the country who users wants to withdraw 
            
            IMPORTANT: Firebase has no multiple condition to query. For this reason, it has to ignore some content here
        */
        if ( user === onlyOtherUid ) { continue; }
        if ( resultFilter[user].nat_withdraw !== onlyNatWithdraw ) { continue; }
        
        count += 1;

        let badge = '';     // define the badge attribute to be inserted into li element
        if (resultFilter[user].badge > 0) { badge = ` data-badge="${resultFilter[user].badge}" `; }
        
        // TODO -> avoid stringify Object to store at checkbox value
        let objStr = resultFilter[user].email;

        // define LI element using Google MDL style
        let liElement = 
        `<li class="mdl-list__item mdl-list__item--two-line">` +
            `<span class="mdl-list__item-primary-content">` +
                `<i class="material-icons mdl-list__item-avatar mdl-badge mdl-badge--overlap" ${badge}">compare_arrows</i>` +
                `<span>${resultFilter[user].displayName}</span>` +
                `<span class="mdl-list__item-sub-title">${resultFilter[user].nat_withdraw} $ ${resultFilter[user].tot_withdraw}</span>` +
            `</span>` +
            `<span  class="mdl-list__item-secondary-action" >` +
                `<label  for="switch-${count}" >` +
                    `<input  type="checkbox" value="${objStr}"  id="switch-${count}"/>` +
                `</label>` +
            `</span>` +
        `</li>`;
        
        $( '.mdl-list' ).append( liElement );
    };
    
    // adding style based on Google MDL structure
    $('li label').addClass('mdl-switch  mdl-js-switch  mdl-js-ripple-effect');
    $('li input').addClass('mdl-switch__input');

    // IMPORTANT: in order to "refresh" Material Design Lite 
    componentHandler.upgradeElements( document.getElementsByClassName('mdl-list') );
}

/*--
	It filters data from Firebase, based on users data
*/
let getUserDataAndList = function (user) {
    firebase.database().ref( '/users/' + user.uid ).once( 'value' ).then( function( snapshot ) {
        let userObj = snapshot.val();
        
        Quotes.existValidQuotes().then( ( quotes ) => {
            /* QUERY DEFINITION: 
                -> list users who wants to deposit at the country who users wants to withdraw 
            */
            fillTransferCard( userObj, quotes );
    		const url = `https://my-currency-community.firebaseio.com/users.json?orderBy="nat_deposit"&equalTo="${userObj.nat_withdraw}"&print=pretty`;
		
            fetch(url).then( response => {
                return response.json();
            }).then( data => {
                fillFilteredUsers(data, user.uid, userObj.nat_deposit);
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

        let path = location.pathname;
        location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
    
    } // end user
}); // end onAuthStateChanged

/*--
	Initializes quotes and login dialog
	(1) Sign in user using email and password on Firebase
*/
$(function() {
    $( "#btn-home" ).click( ( evt ) => {            // HOME
        let path = location.pathname;
        location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
    }); // end btn-home

    // TODO: send data to the next page
    $( "#btn-make-proposal" ).click( ( evt ) => {   // MAKE-PROPOSAL
        
        $( '.mdl-list input:checked' ).each( function() {
            console.log( $(this).val() );
        });
    }); // end btn-make-proposal
    
    $( "#btn-logout" ).click( ( evt ) => {          // LOGOUT
        firebase.auth().signOut().then( function() {
            let path = location.pathname;
            location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
        })
        .catch( function( error ) {
          // TODO: Handle Errors here.
          console.log(`${ error.code } - ${ error.message }`);
        });
    }); // end btn-logout
}); // document ready