//(C) Jord Nijhuis 2013

function Justin(callback) {

    this.name = "Justin";
    this.eventEmitter = new events.EventEmitter();
    callback(this.eventEmitter);
    
    this.eventEmitter.emit("connected");

    this.sendMessage = function (message, callback) {

        var self = this;

        http.request({
            host: "test.ricklubbers.nl",
            path: "/justin2/scripts/load.php?n=" + encodeURIComponent(message),
            port: "80",
            method: "GET"
        }, function (res) {

            var data = "";

            res.on('error', function (error) {

                console.error(error);
            });

            res.on('data', function (chunk) {

                data += chunk;
            });

            res.on('end', function () {

                //Retrieve the message from the JSON and decode it
               self.eventEmitter.emit("message", data.match(/6: (.*)<\/p>/)[1]);
            })
        }).end();
    }

    this.disconnect = function () {};
}