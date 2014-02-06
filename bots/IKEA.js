//(C) Jord Nijhuis 2013

function IKEA(callback) {

    this.name = "IKEA";
    this.eventEmitter = new events.EventEmitter();
    callback(this.eventEmitter);

    this.eventEmitter.emit("connected");

    this.sendMessage = function (message, callback) {

        var self = this;

        http.request({
            host: "ikanna-usen.artificial-solutions.com",
            path: "/ikanna-usen/?ARTISOLCMD_TEMPLATE=STANDARDJSONP&viewname=STANDARDJSONP&userinput=" + encodeURIComponent(message) + "&command=request",
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

                //Remove not used JSONP part
                data = data.replace("null(", "");
                data = data.substring(0, data.length - 2);

                //Retrieve the message from the JSON and decode it
               
                self.eventEmitter.emit("message", decodeURIComponent(JSON.parse(data).responseData.answer).replace(/(<([^>]+)>)/ig,""));
            })
        }).end();
    }

    this.disconnect = function () {};
}