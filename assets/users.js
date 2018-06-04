/* 
	Author: 		Bruno Santos
	Date:			2018-06-04
	Version: 		1.0
	Description:	insert users into Firebase
	
*/

"use strict";
let $ = function (id) {
    return document.getElementById(id);
}

function loadUsers() {
    // Get a reference to the database service
//    writeAnyData("1", "Bruno", "bruno@gmail.com", "/url");

//    writeAuthUser("arthur@gmail.com", "password");
//    writeAuthUser("luiza@gmail.com", "password");
    writeAuthUser("test@gmail.com", "password");
    console.log("loadUsers() okay");
}

//firebase.auth().onAuthStateChanged(function(user) {
//  if (user) {
//    console.log("user logged IN");
//    let user = firebase.auth().currentUser;
//    console.log(user);
//    if (user !== null) {
//        console.log(user.displayName);
//        console.log(user.email);
//        console.log(user.photoURL);
//    }
//  } else {
//    console.log("user logged OUT");
//  }
//});
    
function login() {
    const email = "bruno@gmail.com";
    const pass = "password";
    const name = "Bruno Santos";
    const photoURL = "https://example.com/profile.jpg";
    
    firebase.auth().signInWithEmailAndPassword(email, pass, name, photoURL)
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(`${errorCode} - ${errorMessage}`);
        })
    ; // end singInWithEmail&Passord
    
    console.log("login() okay");
}

//function logout() {
//    firebase.auth().signInWithEmailAndPassword("bruno@gmail.com", "password")
//        .catch(function(error) {
//          // Handle Errors here.
//          var errorCode = error.code;
//          var errorMessage = error.message;
//          console.log(`${errorCode} - ${errorMessage}`);
//        });
//    
//    console.log("load func okay");
//}

//function writeAnyData(userId, name, email, imageUrl) {
//  firebase.database().ref('users/' + userId).set({
//    username: name,
//    email: email,
//    profile_picture : imageUrl
//  });
//}

function writeAuthUser(email, password, name, photoURL) {
//    firebase.auth().createUserWithEmailAndPassword(email, password)
//        .catch(function(error) {
//          // Handle Errors here.
//          let errorCode = error.code;
//          let errorMessage = error.message;
//          console.log(`${errorCode} - ${errorMessage}`);
//        })
//    ; // end createUser
//    var user = firebase.auth().currentUser;
//    
//    if (user != null) {
//        user.updateProfile({
//            displayName: name,
//            photoURL: photoURL
//            
//            }).then(function() {
//                // Update successful.
//                console.log("Update user OKAY!!!")
//            }).catch(function(error) {
//                // An error happened.
//                let errorCode = error.code;
//                let errorMessage = error.message;
//                console.log(`${errorCode} - ${errorMessage}`);
//            })
//        ; // end updateProfile
//    }
}

window.onload = function () {
    $("insert").onclick = loadUsers;
    $("login").onclick = login;
    $("logout").onclick = logout;
}