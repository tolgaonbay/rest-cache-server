
function SimpleCache() {
    this.cache = {};
}

SimpleCache.prototype.get = function get(key) {
    return this.cache[key];
}

SimpleCache.prototype.put = function put(key, value) {
    this.cache[key] = value;
}

module.exports = SimpleCache;
