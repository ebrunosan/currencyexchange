/* 
	Author: 		Bruno Santos
	Date:			2018-05-29
	Version: 		1.0
	Description:	Get random users
	
*/

"use strict";
let $ = function (id) {
    return document.getElementById(id);
}

/*--	Create the type of element you pass in the parameters
*/
let createNode = function(element) {
    return document.createElement(element);
}

/*--	Append the second parameter(element) to the first one
*/
let append = function(parent, el) {
    return parent.appendChild(el);
}

/*--	Fill section based on users object
*/
let fillSections = function(users) {
	const sec_canada = $('left-sec');
	const sec_brazil = $('right-sec');

	console.log(users);
	return users.map( user => { 			// Map through the results and for each run the code below
		let div = createNode('div'), 		// Create the elements we need
			img = createNode('img'),
			span = createNode('span');
		div.classList.add('chip');
		img.src = user.picture.medium;  	// large(128) | medium (72) | thumbnail
		span.innerHTML = `${user.name.first} ${user.name.last}`;
		append(div, img); 					// Append all our elements
		append(div, span);
		if (user.nat === 'CA') {
			append(sec_canada, div);
		} else {
			append(sec_brazil, div);
		}
	});
}

/*--	It gets user's json object from API based on:
		(1) 2 countries Canada and Brazil
		(2) get 6 random users
		(3) retrieve only name, picture, and country
		
		Reference: https://randomuser.me/documentation
*/
let initApp = function() {
	let users = [];
	
	if( localStorage.users ) {				// check if there is data on localStorade
		users = JSON.parse(localStorage.users);
		fillSections(users);
	} else {
		const url = 'https://randomuser.me/api/?results=6&nat=ca,br&inc=name,picture,nat';
		
		fetch(url)
			.then( response => {
				return response.json();
			}).then( data => {
				users = data.results; 		// Set users and save at localStorage
				localStorage.users = JSON.stringify(data.results);
				fillSections(users);
			}).catch( err => {
				console.log("error");		// If there is any error you will catch them here
			});
	}
}

window.onload = function () {
    //$("currency_from").onchange = refreshCmbTo;
	initApp();
}