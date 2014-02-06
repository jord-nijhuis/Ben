//(C) Jord Nijhuis 2014

function HumanInput(callback) {

    this.name = "HumanInput";
    this.eventEmitter = new events.EventEmitter();
    callback(this.eventEmitter);
    
    this.eventEmitter.emit("connected");

    var self = this;

    process.stdin.on('data', function (text) {

        self.eventEmitter.emit("message", ("" + text).trim());
    });

    this.sendMessage = function (message, callback) {}

    this.disconnect = function () {

    };
}