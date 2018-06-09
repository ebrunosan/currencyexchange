/* 
	Author: 		Bruno Santos
	Date:			2018-06-04
	Version: 		1.0
	Description:	authenticate users	
*/

firebase.auth().onAuthStateChanged(function(user) {

// REMOVE LATER
// REMOVE LATER
//function loggedUser(user) {
// REMOVE LATER
// REMOVE LATER

    let dialog = document.querySelector("#login-dialog");

    if (user) {
        // User is logged in

        console.log("user logged IN");
        let user = firebase.auth().currentUser;
        console.log(user);

        $(".login-cover").hide();       // -- Hide login dialog
        dialog.close();

        if (user !== null) {
            console.log(user.displayName);
            console.log(user.email);
            console.log(user.photoURL);
            $("#card-picture").css('background-image', 'url(' + user.photoURL + ')');
            
            $("#user_info").html(`${user.displayName}<br>${user.email}<br>${user.uid}`);
        } //end user not null


    } else {
        // User is logged out

        $(".login-cover").show();       // -- Show login dialog
        dialog.showModal();

        console.log("user logged OUT");
    } // end user
}); // end auth
    
// REMOVE LATER
// REMOVE LATER
//} // end init
// REMOVE LATER
// REMOVE LATER

$(function() {
    console.log( "ready!" );

    // REMOVE LATER
    // REMOVE LATER
//    loggedUser(false);
    // REMOVE LATER
    // REMOVE LATER
    
    // --- LOGIN 
    
    $("#btn-login").click( (evt) => {
        let email = $("#user-email").val();
        let pswd = $("#user-pswd").val();
        console.log(email +" - "+ pswd);

        $("#login-progress").show();
        $("#btn-login").hide();
        
        firebase.auth().signInWithEmailAndPassword(email, pswd)
            .catch(function(error) {
                $("#msgLoginError").show().text(error.message);
                $("#login-progress").hide();
                $("#btn-login").show();
            }) // end catch
        ; // end auth
        $("#login-progress").hide();
        $("#btn-login").show();
        
        console.log("login() okay");
    
        // REMOVE LATER
        // REMOVE LATER
//        loggedUser(true);
        // REMOVE LATER
        // REMOVE LATER

    }); // end login

    // --- LOGOUT
    
    $("#btn-logout").click( (evt) => {
        // REMOVE LATER
        // REMOVE LATER
//        loggedUser(false);
        // REMOVE LATER
        // REMOVE LATER

        firebase.auth().signOut()
            .then(function() {
                console.log("logout successful")
            }) // end then
            .catch(function(error) {
              // Handle Errors here.
              console.log(`${error.code} - ${error.message}`);
            }) // end catch

        ; // end auth
    }); // end logout
}); // document ready