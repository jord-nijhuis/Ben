//(C) Jord Nijhuis 2013

function Omegle(callback) {

    this.name = "Omegle";

    this.eventEmitter = new events.EventEmitter();
    callback(this.eventEmitter);


    this.init = function(){

        var self = this;

        this.omegleStart(function(id){

            self.doEvents();
        });
    }

    this.sendMessage = function (message, callback) {

        var self = this;

        var req = http.request({
            host: "front3.omegle.com",
            path: "/send",
            port: "80",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": Buffer.byteLength("id=" + self.id + "&msg=" + message),
                "Connection": "keep-alive"
            }
        }, function (res) {

            var data = "";

            res.on('error', function (error) {

                console.error(error);
            });

            res.on('data', function(data){

            });

            res.on('end', function(){

            });

        });

        req.write("id=" + self.id + "&msg=" + message);
        req.end();
    }

    this.disconnect = function () {

        var self = this;

        var req = http.request({
            host: "front3.omegle.com",
            path: "/disconnect",
            port: "80",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": Buffer.byteLength("id=" + self.id),
                "Connection": "keep-alive"
            }
        }, function (res) {

            var data = "";

            res.on('error', function (error) {

                console.error(error);
            });

            res.on('data', function (chunk) {

                data += chunk;
            });

            res.on('end', function () {

               
            });
        });

        req.write("id=" + this.id);
        req.end();
    };


    this.omegleStart = function(callback){
        var self = this;

        http.request({
            host: "front3.omegle.com",
            path: "/start?rcs=1&firstevents=1&lang=en",
            port: "80",
            method: "GET"
        }, function (res) {

            var data = "";

            res.on('error', function (error) {

                console.error(error);
                callback(undefined, error);
            });

            res.on('data', function (chunk) {

                data += chunk;
            });

            res.on('end', function () {

                if(JSON.parse(data).events[0][0] == "recaptchaRequired"){

                    self.eventEmitter.emit("connected");
                    console.log("(Recaptcha required)");
                    self.eventEmitter.emit("disconnected")
                }

                self.id = JSON.parse(data).clientID;
                callback(self.id);
            });
        }).end();
    }

    this.omegleEvent = function(callback){

        var self = this;

        var req = http.request({
            host: "front3.omegle.com",
            path: "/events",
            port: "80",
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": Buffer.byteLength("id=" + self.id),
                "Connection": "keep-alive"
            }
        }, function (res) {

            var data = "";

            res.on('error', function (error) {

                callback(undefined, error);
            });

            res.on('data', function (chunk) {

                data += chunk;
            });

            res.on('end', function () {

                callback(JSON.parse(data));
            });
        });

        req.write("id=" + this.id);
        req.end();
    }

    this.doEvents = function(){

        var self = this;

        this.omegleEvent(function (data){

        
            if(data != null){

                if(data[0] == "connected") self.eventEmitter.emit("connected");
                if(data[0] == "typing") console.log("(Typing)");
                if(data[0][0] == "gotMessage") self.eventEmitter.emit("message", data[0][1]);
                if(data[0] == "strangerDisconnected") self.eventEmitter.emit("disconnected");
            }

            self.doEvents();
        });
    }

    this.init();
}