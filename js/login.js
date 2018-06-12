/* 
	Author: 		Bruno Santos
	Date:			2018-06-04
	Version: 		1.0
	Description:	1) authenticates users at Firebase 	
	                2) Get realtime currency quotes based on API call
					3) Provides currency exchange conversion
					4) Formats money exchange card based on users values
					
					API documentation: https://currencylayer.com/documentation
*/

"use strict";
const usd = 'USD';

/* Sample quote object formated:
	{
		"USD": { "CAD":1.299810, "BRL":3.719599 }
		"CAD": { "USD":0.769343, "BRL":2.861648 }	-- 1/USD->CAD , CAD->USD * USD->BRL
		"BRL": { "USD":0.769343, "CAD":2.861648 }	-- 1/USD->BRL , BRL->USD * USD->CAD
	}
*/
let quotes = {};            // TODO: create a class to set/get quotes

/*--
	It gets json quote object from API based on:
	(1) FROM realtime USD quotes
	(2) TO fixed currencies quotes: CAD, BRL, EUR 
*/
let initQuotes = function() {
//    if( localStorage.quotes ) {                    // check if there is data on localStorade
//		quotes = JSON.parse(localStorage.quotes);  // TODO: set/get quote expiration time 
//	} else {
        firebase.database().ref('/quotes/').once('value').then(function(snapshot) {
            quotes = snapshot.val();
            localStorage.quotes = JSON.stringify(quotes);
        });
//    }
};

/*--
	It fills the html user card
	(1) picture, Name, email, and phone
*/
let fillUserCard = function(user, userObj) {
    $("#user-picture").css('background-image', 'url(' + user.photoURL + ')');
    $("#user-name").text(user.displayName);
    $("#user_info").html(`${user.email}<br>Phone: ${userObj.phone}`);
}

/*--
	It fills the html transfer card
	(1) flag, quote, value to withdraw/transfer, total current value to transfer
*/
let fillTransferCard = function(userObj) {
    // TODO: create CARD html 'Transfer' for each obj in database

    let quote = quotes[userObj.nat_withdraw][userObj.nat_deposit];
    let totalDep = (quote * userObj.tot_withdraw).toFixed(2);
    let transferTitle = `From ${userObj.nat_withdraw} to ${userObj.nat_deposit}`;

    let transferDetails = `${userObj.nat_withdraw} $ ${userObj.tot_withdraw} <br />`;
    transferDetails += `Quote for 1 ${userObj.nat_withdraw} is ${quote} ${userObj.nat_deposit} <br />`;
    transferDetails += `<strong>Total ${userObj.nat_deposit} $ ${totalDep}</strong>`;

    $("#transfer-flag").attr('src', `./image/${userObj.nat_deposit}.svg`);
    $("#transfer-title").text(transferTitle);
    $("#transfer-details").html(transferDetails);
}

/*--
	It is a Firebase event handler to check authentication changes
	(1) get authenticated user info and users information
*/
firebase.auth().onAuthStateChanged(function(user) {
    let dialog = document.querySelector("#login-dialog");

    if (user) {                         // User is logged in
        let user = firebase.auth().currentUser;

        $(".login-cover").hide();       // Hide login dialog
        dialog.close();

        if (user !== null) {
            firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
                let userObj = snapshot.val();

                fillUserCard(user, userObj);
                fillTransferCard(userObj);
            });
        } //end user not null
    } else {                                    // User is logged out
        $(".login-cover").show();               // Show login dialog
        dialog.showModal();
    } // end user
}); // end onAuthStateChanged

/*--
	Initializes quotes and login dialog
	(1) Sign in user using email and password on Firebase
*/
$(function() {
    initQuotes();
    
    $("#btn-login").click( (evt) => {           // LOGIN
        let email = $("#user-email").val();
        let pswd = $("#user-pswd").val();

        $("#login-progress").show();
        $("#btn-login").hide();

        firebase.auth().signInWithEmailAndPassword(email, pswd).catch(function(error) {
            $("#msgLoginError").show().text(error.message);
            $("#login-progress").hide();
            $("#btn-login").show();
        });
        
        $("#login-progress").hide();
        $("#btn-login").show();
    }); // end click

    $("#btn-logout").click( (evt) => {          // LOGOUT
        firebase.auth().signOut().then(function() {
          console.log("logout successful")
        })
        .catch(function(error) {
          // TODO: Handle Errors here.
          console.log(`${error.code} - ${error.message}`);
        });
    }); // end click
}); // document ready