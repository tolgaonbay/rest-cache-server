

function Service(service) {
    for (var prop in service)
        this[prop] = service[prop];
}

Service.prototype.updateResult = function(result) {
   this.result = result; 

   this.validUntil = new Date(new Date().getTime() + this.timeToLive * 1000);
}

Service.prototype.isExpired = function() {
    return this.validUntil < new Date();
}

module.exports = Service;
