const usersRoute = require( './users.js' );

let appRouter = function ( app ) {

  app.get('/', function( req, res ) {
    res.status( 200 ).send( 'Welcome to our restful API' );
  });

  // --- return all user's list based on 
  app.get( '/users/all', function ( req, res ) {
      usersRoute.filterUser( 1000 ).then( ( data ) => {
      //usersRoute.list( 1000 ).then( ( data ) => {
        let users = data;
        res.status( 200 ).send( users );

      }).catch( ( err ) => {
        res.status( 400 ).send( { message: err.message } );

      }); // load
      
  }); // get

  // --- return the user's list based on a quantity required in num param
  app.get( '/users/:num', function ( req, res ) {
    let num = req.params.num;

    if (isFinite( num ) && num > 0 ) {
      
      usersRoute.list( num ).then( ( data ) => {
        let users = data;
        res.status( 200 ).send( users );

      }).catch( ( err ) => {
        res.status( 400 ).send( { message: err.message } );

      }); // load
      
    } else {
      
      res.status( 400 ).send( { message: 'invalid number supplied' } );
      
    } // if
  }); // get
  
} // router

module.exports = appRouter;