module.exports = function() {
    var conf = {
        
    };
    switch(process.env.NODE_ENV) {
        case "production":
            return {};
        default: // development
            return {}
    }
};