/* 
	Author: 		Bruno Santos
	Date:			2018-06-24
	Version: 		1.0
	Description:	
    
*/

"use strict";

/*--
	Initializes quotes and login dialog
	(1) Sign in user using email and password on Firebase
*/
$(function() {
    $( "#btn-run" ).click( ( evt ) => {
        let path = location.pathname;
        location.pathname = path.substring(0, path.lastIndexOf('/') + 1) + 'login.html';
    });
}); // document ready