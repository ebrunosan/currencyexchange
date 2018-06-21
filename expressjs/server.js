const express    = require( 'express' );
const app        = express( );
const bodyParser = require( 'body-parser' );
const routes     = require( './routes/index.js' );

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );

routes( app );

let server = app.listen( 8080, function () {
    console.log( "app running on port." , server.address().port );
});