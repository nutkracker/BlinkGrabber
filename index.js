const Blink = require('node-blink-security');
const BlinkCamera = require('node-blink-security');
const fs = require('fs');

var blink;
var tok;
var https = require('https');
var base_url;
var base_host;
var emailaddress;
var password;
var syncmod;
var cameraID;
var intervalInMillisecs;
var filecount;

const config_data = require('./grabber_config.json');
emailaddress = config_data.emailaddress;
password = config_data.password;
syncmod = config_data.syncmod;
cameraID = unescape(config_data.cameraID);
intervalInMillisecs = config_data.intervalInMillisecs;
filecount = 0;

console.log("Please wait...login in progress...");
blink = new Blink(emailaddress, password);
blink.setupSystem(syncmod)
	.then(() =>
	    {
	    	console.log("Logged in.");

			takePicture(cameraID);
	    	fetchStill(cameraID);
	    	setInterval(doIt(cameraID), intervalInMillisecs);

	    },
	    (error) =>
	    {
			console.log("Login failed.");
	      	console.log(error);
	    });


function doIt(cameraID)
{
	return function()
	{
		blink = new Blink(emailaddress, password);
		blink.setupSystem(syncmod)
		.then(() =>
		{
			takePicture(cameraID);
			fetchStill(cameraID);
		},
		(error) =>
		{
			console.log("Login failed.");
		})
	}
}

function fetchStill(cameraID)
{
	bk = new BlinkCamera();
	bk = blink._cameras[cameraID];
	
	console.log("Retrieving still image from [" + syncmod + "] " + bk._name);

	bk.fetchImageData()
	.then(function(resp)
		{
			filecount=filecount+1;
			fs.writeFile("["+filecount+ "-" + syncmod + "-" + bk._name + "]_" + bk._thumb.substring(bk._thumb.lastIndexOf("/")+1), resp, function(err)
			{
				if(err)
				{
					console.log(err);
				}
				console.log("Still saved");
			});
		}).then(function(json)
		{
			//console.log('Success:');
		})
	.catch(function(error)
		{
			console.log('Error: ', error);
		});
}

function takePicture(cameraID)
{
	bk = new BlinkCamera();
	bk = blink._cameras[cameraID];
	
	console.log("Taking new picture on [" + syncmod + "] " + bk._name);

	bk.snapPicture()
	.then(function(resp)
		{
			console.log("Still taken");
		}).then(function(json)
		{
			//console.log('Success:');
		})
	.catch(function(error)
		{
			console.log('Error: ', error);
		});		
}

