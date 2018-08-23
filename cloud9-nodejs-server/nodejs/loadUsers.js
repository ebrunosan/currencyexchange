// DEPENDENCIE ==> npm install firebase-admin --save
//
// DEPENDENCIE ==> npm install node-fetch --save
//          https://www.npmjs.com/package/node-fetch

let admin = require("firebase-admin");
let fetch = require("node-fetch");

var serviceAccount = require("./../data/my-firebase-adminsdk.json");

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
    clearUsersLogin();

	const url = 'https://randomuser.me/api/?seed=foo&results=50&nat=au,ca,ch,br,us&inc=login,name,email,picture,nat,phone';

	fetch(url)
		.then( response => {
			return response.json();
		}).then( data => {
			addUserToFirebase(data.results);    // add returned users into FB
// 		}).catch( err => {
// 			console.log("error");		        // TODO: catch error
		})
	; // END fetch
};

let clearUsersLogin = function() {
    // list all users into Authentication DB
    admin.auth().listUsers(1000)
        .then(function(listUsersResult) {
            listUsersResult.users.forEach(function(userRecord) {
                // delete each user by UID
                deleteSingleUser(userRecord.toJSON().uid);
            });
        }).catch(function(error) {
            console.log("Error deleting all users:", error);
        })
    ; // END listUsers
    
    admin.database().ref('users').remove();     // clear "users" DB
};

let deleteSingleUser = function(uid) {
    admin.auth().deleteUser(uid).then(function() {
        console.log("Successfully deleted user");
    }).catch(function(error) {
        console.log("Error deleting user:", error);
    }); // END deleteUser
};

let formatName = function(fName, lName) {
    fName = fName.charAt(0).toUpperCase() + fName.substr(1);
    lName = lName.charAt(0).toUpperCase() + lName.substr(1);
    return `${fName} ${lName}`;
};

let getFormattedNat = function(nat) {
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
            ret = 'USD';
            break;
        case 'AU':
            ret = 'AUD';
            break;
    }
    return ret;
};

let getRndInteger = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// returns random nat other than param nat
let getRndCountry = function(natParam) {
    let nats = { 
        0:'CAD',
        1:'CLP',
        2:'BRL',
        3:'USD',
        4:'AUD',
    };

    let newNat = 0;
    do {
        newNat = getRndInteger(0, 4);
    } while (nats[newNat] === natParam);

    return nats[newNat];
};

// returns random values: 500 or 1000 or 1500
let getRandomVal = function(nat) {
    return 500 * getRndInteger(1,3);
};

// returns random values: 500 or 1000 or 1500
let getRandomBadge = function(nat) {
    let num = getRndInteger(1,10);
    return (num < 5? 0 : num);
};

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
    
            }).then(function( userRecord ) {
                let userNat = getFormattedNat(user.nat);
            
                let userObj = {
                    'displayName'   : formatName(user.name.first, user.name.last),
                    'photoURL'      : user.picture.large,
                    'email'         : user.email,
                    'phone'         : user.phone,
                    'nat_withdraw'  : userNat,
                    'tot_withdraw'  : getRandomVal(),
                    'nat_deposit'   : getRndCountry(userNat),
                    'badge'         : getRandomBadge(),
                };
                
                admin.database().ref('users/' + user.login.username).set(userObj);

                console.log("Successfully created new user:", user.login.username);

            }).catch(function(error) {
                console.log("Error creating new user:", user.login.username);
            }); // END createUser
    }); // END map
}; // END function

initApp();