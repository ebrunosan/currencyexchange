/* 
	Author: 		Bruno Santos
	Date:			2018-06-04
	Version: 		1.0
	Description:	authenticate users	
*/

"use strict";
let $ = function (id) {
    return document.getElementById(id);
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    console.log("user logged IN");
    let user = firebase.auth().currentUser;
    console.log(user);
    if (user !== null) {
        console.log(user.displayName);
        console.log(user.email);
        console.log(user.photoURL);
    } //end user not null
  } else {
    console.log("user logged OUT");
  } // end user
}); // end auth
    
function login() {
    const email = "gabriel.chan@example.com";
    const pass = "password";
    
    firebase.auth().signInWithEmailAndPassword(email, pass)
        .catch(function(error) {
          // Handle Errors here.
          console.log(`${error.code} - ${error.message}`);
        }) // end catch
    ; // end auth
    console.log("login() okay");
} // end login

function logout() {
    firebase.auth().signOut()
        .then(function() {
            console.log("logout successful")
        }) // end then
        .catch(function(error) {
          // Handle Errors here.
          console.log(`${error.code} - ${error.message}`);
        }) // end catch
    
    ; // end auth
} // end logout

window.onload = function () {
    $("login").onclick = login;
    $("logout").onclick = logout;
}