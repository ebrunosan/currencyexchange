// DEPENDENCIE ==> npm install firebase-admin --save
//
// DEPENDENCIE ==> npm install node-fetch --save
//          https://www.npmjs.com/package/node-fetch

let admin = require("firebase-admin");
let fetch = require("node-fetch");

var serviceAccount = require("./keys/my-firebase-adminsdk.json");

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

	const url = 'https://randomuser.me/api/?results=10&nat=au,ca,ch,br,us&inc=login,name,email,picture,nat,phone';

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

let formatName = function(fName, lName) {
    fName = fName.charAt(0).toUpperCase() + fName.substr(1);
    lName = lName.charAt(0).toUpperCase() + lName.substr(1);
    return `${fName} ${lName}`;
}

let formatNat = function(nat) {
    let ret = '';
    switch (nat) {
        case 'CA':
            ret = 'CAD';
            break;
        case 'CH':
            ret = 'CLP';
            break;
        case 'BR':
            ret = 'BRL';
            break;
        case 'US':
            ret = 'USA';
            break;
        case 'AU':
            ret = 'AUD';
            break;
    }
    return ret;
}

let rndTransferNat = function(nat) {
    // TODO
    return 'BRL';
}

let addUserDataToFirebase = function(user) {
    // TODO generate random nat_deposit and tot_withdraw
    let userObj = {
        'phone': user.phone,
        'nat_withdraw': formatNat(user.nat),
        'tot_withdraw': 500,
        'nat_deposit': rndTransferNat(user.nat),
    };
    console.log(userObj);
    admin.database().ref('users/').child(user.login.username).set(userObj); 
    // END database
//                 "nat").set(user.nat)
//            .child("phone").set(user.phone)
//            .child("money_wanted").set(0.0)
    ; // END database
}

let addUserToFirebase = function(users) {
    users.map( user => {
        admin.auth().createUser({
            displayName:    formatName(user.name.first, user.name.last),
            photoURL:       user.picture.large,
            email:          user.email,
            uid:            user.login.username,// set UID as login.username
            password:       "password",         // FIXED password
            emailVerified:  true,
            disabled:       false
    
            }).then(function(userRecord) {
                console.log("Successfully created new user:", user.login.username);

            }).catch(function(error) {
                console.log("Error creating new user:", user.login.username);
            })
            
            let userObj = {
                'phone': user.phone,
                'nat_withdraw': formatNat(user.nat),
                'tot_withdraw': 500,
                'nat_deposit': rndTransferNat(user.nat),
            };
            // console.log(userObj);

            admin.database().ref('users/' + user.login.username).set(userObj);

        ; // END CreateUser
        
    });
}

initApp();