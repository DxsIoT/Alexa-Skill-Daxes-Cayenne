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

app.intent("ChannelIntent", 
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": [
			"status for channel {channel}",
			"channel {channel} status"
		]
	},
	function(request, response){
		var channel = request.slot("channel");
		console.log('channel: ' + channel);
		response.say("You have selected channel number " + channel);
	}
);

app.intent("ChannelOnIntent",
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": ["Switch On Channel {channel}"]
	},
	function(request,response){
		if(connected){
			var channel = request.slot("channel");
			Client.Channel('ch' + channel).switchOn();
			response.say("Channel " + channel + " switched on.")
		}else{
			response.say("Client is not connected");
		}
	}
);

app.intent("ChannelOffIntent",
	{
		"slots": { "channel" : "AMAZON.NUMBER"},
		"utterances": ["Switch Off Channel {channel}"]
	},
	function(request,response){
		if(connected){
			var channel = request.slot("channel");
			Client.Channel('ch' + channel).switchOff();
			response.say("Channel " + channel + " switched off.")
		}else{
			response.say("Client is not connected");
		}
	}
);


app.intent("ConnectIntent",
	{
		"slots": {},
		"utterances": ["Connect"]
	},
	function(request,response){
		Client.connect();
		connected = true;
	}
);

// connect the alexa-app to AWS Lambda
exports.handler = app.lambda();