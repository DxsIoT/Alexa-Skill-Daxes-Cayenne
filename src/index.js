require('dotenv').config()
var alexa = require("alexa-app");
var app = new alexa.app("Daxes-Cayenne");

var Cayenne = require('cayenne-mqtt');

var options = {
  'clientId' : process.env.MQTT_CLIENT,
  'username' : process.env.MQTT_USER,
  'password' : process.env.MQTT_PASS,
  'debug': process.env.MQTT_DEBUG
}
var Client = new Cayenne.Client(options);

var connected = false;

app.launch(function(request, response) {
  //response.shouldEndSession(false);
  return response.card("Daxes Cayenne Skill", "This is a Test Skill for manage a Cayenne dashboard")
  				 .say("Hello, this is a Test Skill for manage a Cayenne dashboard")
  				 .shouldEndSession(false)
  				 .send();  
});

app.intent("HelloIntent", 
	{
		"slots": {},
		"utterances": ["Hello"]
	},
	function(request, response) {
	//var number = request.slot("number");
	response.say("Hello Guest!");
	}
);

var channels_available = ['ch1','ch2','ch3','ch4','ch5'];

app.intent("ChannelIntent", 
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": [
			"status for channel {channel}",
			"channel {channel} status"
		]
	},
	function(request, response){
		var number = request.slot("channel");
		var channel = 'ch' + number;
		if( channels_available.indexOf(channel) < 0 ){
			return response.say("Channel " + number + " is not available")
						   .shouldEndSession(false)
						   .send();
		}else{
			console.log('channel: ' + channel);
			return response.say("You have selected channel number " + channel)
						   .shouldEndSession(false)
						   .send();
		}		
	}
);

app.intent("ChannelOnIntent",
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": ["switch on Channel {channel}", "switch on the Channel {channel}"]
	},
	function(request,response){
		if(connected){
			var number = request.slot("channel");
			var channel = 'ch' + number;
			if( channels_available.indexOf(channel) < 0 ){
				return response.say("Channel " + number + " is not available")
							   .shouldEndSession(false)
							   .send();
			}else{
				Client.Channel(channel).switchOn();
				return response.say("Channel " + number + " was switched on")
							   .shouldEndSession(false)
							   .send();
			}					
		}else{
			return response.say("Client is not connected")
						   .shouldEndSession(false)
						   .send();
		}
	}
);

app.intent("ChannelOffIntent",
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": ["switch off Channel {channel}", "switch off the Channel {channel}"]
	},
	function(request,response){
		if(connected){
			var number = request.slot("channel");
			var channel = 'ch' + number;
			if( channels_available.indexOf(channel) < 0 ){
				return response.say("Channel " + number + " is not available.")
							   .shouldEndSession(false)
							   .send();
			}else{
				Client.Channel(channel).switchOff();
				return response.say("Channel " + number + " was switched off.")
							   .shouldEndSession(false)
							   .send();
			}					
		}else{
			return response.say("Client is not connected")
						   .shouldEndSession(false)
						   .send();
		}
	}
);


app.intent("ConnectIntent",
	{
		"slots": {},
		"utterances": ["connect dashboard","connect to server","connect client"]
	},
	function(request,response){
		Client.connect();
		connected = true;
		return response.say("Client connected")
					   .shouldEndSession(false)
					   .send();
	}
);

// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();