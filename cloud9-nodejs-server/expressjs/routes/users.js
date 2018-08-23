let admin = require("firebase-admin");
let fetch = require("node-fetch");

let serviceAccount = require("./../data/my-firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://my-currency-community.firebaseio.com"
});

exports.filterUser = function( num ) {
  
  return new Promise( ( resolve, reject ) => {

      admin.database().ref( 'users' ).orderByChild( 'nat_deposit' )
        .equalTo( 'USD' ).once( 'value' )

        .then( function ( data ) {
          let usersObj = {};
          
          data.forEach( function ( user ) {
            
            admin.auth().getUser( user.key )
              .then( function ( userLogin ) {
              
                userLogin = userLogin.toJSON();
                let userVal = user.val();
                
                let singleUserObj = {
                    'email'         : userLogin.email,
                    'displayName'   : userLogin.displayName,
                    'photoURL'      : userLogin.photoURL,
                    'phone'         : userVal.phone,
                    'nat_deposit'   : userVal.nat_deposit,
                    'nat_withdraw'  : userVal.nat_withdraw,
                    'tot_withdraw'  : userVal.tot_withdraw,
                }; // singleUser
                
                usersObj[ user.key ] = singleUserObj;
                console.log(user.key);
            }); // getUser

          }); // forEach
          
          console.log(usersObj);
          resolve( usersObj );
        
        }).catch(function( error ) {
          let msg = Error( "Error getting users:", error.message );
          reject( msg );
          
        }); // admin
    } // func inside promise
  ); // Promise
  
}; // main func


exports.list = function( num ) {
  
  return new Promise( ( resolve, reject ) => {
      // admin.auth().listUsers( Number( num ) ) // Works Okay

      admin.database().ref( 'users' )
        .orderByKey()
        .limitToFirst( num ) // TODO change for parameter num
        .once( 'value' )
        .then( ( records ) => {

console.log('--- records');
console.log(records);

          let usersObj = {};

          records.users.forEach( ( user ) => {
console.log('--- user');
console.log(user);
            user = user.toJSON();
            let singleUserObj = {
                'email'         : user.email,
                'displayName'   : user.displayName,
                'photoURL'      : user.photoURL,
                'phone'         : user.phone,
                'nat_deposit'   : user.nat_deposit,
                'nat_withdraw'  : user.nat_withdraw,
                'tot_withdraw'  : user.tot_withdraw,
            }; 
            
            usersObj[ user.uid ] = singleUserObj;
          });
          
          resolve( usersObj );
        
        }).catch(function( error ) {
console.log(error);
          let msg = Error( "Error getting users:", error.message );
          reject( msg );
          
        }); // admin
      //admin.database().ref('users').remove();     // clear "users" DB
    } // func inside promise
  ); // Promise
  
}; // main func
