//(C) Jord Nijhuis 2014
var http        = require("http"),
    fs          = require("fs"),
    path        = require("path"),
    events      = require("events"),
    util        = require("util");
    crypto      = require("crypto");

var messages = [];

//Include all the bots
eval(fs.readFileSync(path.resolve(__dirname, './bots/Omegle.js')) + '');
eval(fs.readFileSync(path.resolve(__dirname, './bots/Cleverbot.js')) + '');
eval(fs.readFileSync(path.resolve(__dirname, './bots/IKEA.js')) + '');
eval(fs.readFileSync(path.resolve(__dirname, './bots/Justin.js')) + '');
eval(fs.readFileSync(path.resolve(__dirname, './bots/HumanInput.js')) + '');

/* Creates a pretty string of the difference in the format 1h1m1s
 * @param date The old date
 * @return The pretty date
 */

function prettyDifference(date) {

    var difference = Math.round((new Date() - date) / 1000),
        string = "";

    if (difference > 3600) {

        hourDifference = Math.floor(difference / 3600);
        difference -= 3600 * hourDifference;
        string += hourDifference + "h";
    }

    if (difference > 60) {

        minuteDifference = Math.floor(difference / 60);
        difference -= 60 * minuteDifference;
        string += minuteDifference + "m"
    }

    string += difference + "s";

    return string;
}

/* Generates a random greet
 * @return The greet
 */

function greet() {

    var greets = ["Hello", "Hi", "How are you doing?", "Ohi", "ASL"];

    return greets[Math.floor(Math.random() * greets.length)];
}

/* Creates a conversation between two bots
 * @param callback The callback for when an error occours or when the conversation ends
 */

function Conversation() {

    this.bot1 = undefined;
    this.bot2 = undefined;
    this.connects = 0;
    this.start = undefined;

    this.log = function (message) {

        this.stream.write(message + "\r\n");
        console.log(message);
    }

    this.connect = function (){

        var self = this;

        messages        = [];
        this.start      = new Date();
        this.connects   = 0;

        this.bot1 = new Omegle(function(res){

            res.on("connected", function (){

                console.log("(Bot1 connected)");
                self.connects++;

                self.checkConnect();
            });

            res.on("message", function (message){

                //Add message to the front of the array
                messages.unshift(message);
                //Send it to Bot2
                self.bot2.sendMessage(message, function (error){

                    if(error) console.error(error);
                });

                //Log it
                self.log("Bot1: " + message);
            });

            res.on("disconnected", function (){

                //Bot1 disconnected, disconnect bot2
                self.bot2.disconnect();

                self.log("Bot1 disconnected, disconnecting Bot2...");
                self.log("Conversation took " + prettyDifference(self.start) + " and had a total of " + messages.length + " messages.");

                //Reconnect
                self.connect();
            });
        });


        this.bot2 = new IKEA(function(res){

            res.on("connected", function(){

                console.log("(Bot2 connected)");
                self.connects++;

                self.checkConnect();
            });

            res.on("message", function (message){

                //Add message to the front of the array
                messages.unshift(message);
                //Send it to Bot1
                self.bot1.sendMessage(message, function (error){

                    if(error) console.error(error);
                });

                //Log it
                self.log("Bot2: " + message);

            });

            res.on("disconnected", function(){

                //Bot2 disconnected, disconnect bot1
                self.bot2.disconnect();

                self.log("Bot1 disconnected, disconnecting Bot2...");
                self.log("Conversation took " + prettyDifference(self.start) + " and had a total of " + messages.length + " messages.");

                //Reconnect
                self.connect();

             });
        });
    }

    this.checkConnect = function (){

        //Both bots are connected
        if(this.connects == 2){

            //Create the stream
            this.stream = fs.createWriteStream(path.resolve(__dirname, './logs/' + this.start.toISOString().replace(/T/, '').replace(/\..+/, '').replace(/:/g, "").replace(/-/g, "") + '.log'));

            //Create a greeting and send it
            var gr = greet();
            this.log("Node: " + gr);
            messages[0] = gr;

            this.bot1.sendMessage(gr);
        }
    }

    this.disconnect = function (){

        this.log("Disconnecting Bot1 and Bot2...");
        this.log("Conversation took " + prettyDifference(this.start) + " and had a total of " + messages.length + " messages.");

        this.bot1.disconnect();
        this.bot2.disconnect();
    }

    this.reconnect = function (){

        this.disconnect();
        this.connect();
    }
}

var conv = new Conversation();
conv.connect();

process.on('uncaughtException', function (error) {

    console.error(error);
    conv.reconnect();
});

process.on('SIGINT', function() {

    conv.disconnect();
    process.exit(0);
});

process.stdin.resume();