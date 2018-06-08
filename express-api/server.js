// DEPENDENCIE ==> npm install firebase-admin --save
//
// DEPENDENCIE ==> npm install node-fetch --save
//          https://www.npmjs.com/package/node-fetch

let admin = require("firebase-admin");
let fetch = require("node-fetch");

var serviceAccount = require("./test/my-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-currency-community.firebaseio.com"
});

/*--
    It gets user's json object from API based on:
		(1) 2 countries Canada and Brazil
		(2) get 6 random users
		(3) retrieve only name, picture, and country
		
		Reference: https://randomuser.me/documentation
*/
let initApp = function() {
    deleteAllUsers();

	const url = 'https://randomuser.me/api/?results=6&nat=ca,br&inc=login,name,email,picture,nat';

	fetch(url)
		.then( response => {
			return response.json();
		}).then( data => {
			addUserToFirebase(data.results);    // add returned users into FB
// 		}).catch( err => {
// 			console.log("error");		        // TODO: catch error
		})
	; // END fetch
}

let deleteAllUsers = function() {
    // list all users into Authentication DB
    admin.auth().listUsers(1000)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
                // delete each user by UID
                deleteSingleUser(userRecord.toJSON().uid);
            });
        }).catch(function(error) {
            console.log("Error listing users:", error);
        })
    ; // END listUsers
    
    admin.database().ref('users').remove();     // clear "users" DB
}

let deleteSingleUser = function(uid) {
    admin.auth().deleteUser(uid)
        .then(function() {
            console.log("Successfully deleted user");
        }).catch(function(error) {
            console.log("Error deleting user:", error);
        })
    ; // END deleteUser
}

let addUserToFirebase = function(users) {
    users.map( user => {
        console.log("Login=" + user.login.username +" EMAIL="+ user.email);
        console.log(user.name);
        
        admin.auth().createUser({
            displayName:    `${user.name.first} ${user.name.last}`,
            photoURL:       user.picture.medium,
            email:          user.email,
            uid:            user.login.username,// set UID as login.username
            password:       "password",         // FIXED password
            emailVerified:  true,
            disabled:       false
    
            }).then(function(userRecord) {
                console.log("Successfully created new user:", userRecord.uid);

            }).catch(function(error) {
                console.log("Error creating new user:", error);
            })
        ; // END CreateUser
        
        admin.database()                        // Add user into FB                     
            .ref('users/' + user.nat + "/" + user.login.username)
            .child("money_wanted").set(0.0)
        ; // END database
    });
}

initApp();