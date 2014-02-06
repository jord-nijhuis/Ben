//(C) Jord Nijhuis 2014
function Cleverbot(callback) {

    this.name = "Cleverbot";

    this.sessionid = undefined;
    this.prevref = undefined;
    
    this.eventEmitter = new events.EventEmitter();
    callback(this.eventEmitter);

    this.eventEmitter.emit("connected");

    this.sendMessage = function (message, callback, begin, end) {

        var vars = {
            "start": "y",
            "icognoid": "wsf",
            "fno": "0",
            "sub": "Say",
            "islearning": "1",
            "cleanslate": false,
            "stimulus": message
        };

        var dataDigest = crypto.createHash('md5').update(this.httpBuildQuery(vars).substring(begin, end)).digest("hex");

        vars.icognocheck = "" + dataDigest;
        vars.vText8 = (messages[6] ? messages[6] : "");
        vars.vText7 = (messages[5] ? messages[5] : "");
        vars.vText6 = (messages[4] ? messages[4] : "");
        vars.vText5 = (messages[3] ? messages[3] : "");
        vars.vText4 = (messages[2] ? messages[2] : "");
        vars.vText3 = (messages[1] ? messages[1] : "");
        vars.vText2 = (messages[0] ? messages[0] : "");

        vars.prevref            = "";
        vars.emotionaloutput    = "";
        vars.emotionalhistory   = "";
        vars.asbotsname         = "";
        vars.ttsvoice           = "";
        vars.typing             = "";
        vars.lineref            = "";

        if (this.sessionid) vars.sessionid  = this.sessionid;
        if (this.prevref) vars.prevref      = this.prevref;

        var data = this.httpBuildQuery(vars),
            self = this;

        var req = http.request({
            host: "www.cleverbot.com",
            port: "80",
            path: "/webservicemin",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Content-Length": Buffer.byteLength(data)
            }
        }, function (res) {

            var data = "";
            res.setEncoding('utf8');

            res.on('error', function (error) {

                console.error(error);
            });

            res.on('data', function (chunk) {

                data += chunk;
            })

            res.on('end', function () {

                var lines = data.split("\r");

                self.sessionId = lines[1];
                self.prevref = lines[10];

                self.eventEmitter.emit("message", lines[0].trim());
            })
        });

        req.write(data);
        req.end();
    }

    this.disconnect = function () {};

    /* Creates a valid HTTP-query from an array
    * @param array The Array
    * @return The Query
    */

    this.httpBuildQuery = function(array) {

        var data = "";

        for (var i in array) {
            data += i + "=" + array[i] + "&";
        }

        return encodeURI(data.substring(0, data.length - 1));
    }
}