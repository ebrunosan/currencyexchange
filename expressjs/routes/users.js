let admin = require("firebase-admin");
let fetch = require("node-fetch");

let serviceAccount = require("./../data/my-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-currency-community.firebaseio.com"
});

module.exports.list = function( num ) {
  
  return new Promise( ( resolve, reject ) => {
      admin.auth().listUsers( Number( num ) )
        
        .then( ( listUsersResult ) => {
          let usersObj = {};
          
          listUsersResult.users.forEach( ( userRecord ) => {
            usersObj[ userRecord.toJSON().uid ] = userRecord.toJSON();
          });
          
          resolve( usersObj );
        
        }).catch(function( error ) {
          let msg = Error( "Error getting users:", error.message );
          reject( msg );
          
        }); // admin
      //admin.database().ref('users').remove();     // clear "users" DB
    } // func inside promise
  ); // Promise
}; // main func
