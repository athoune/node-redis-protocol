var bulk = function(writer, value) {
    var b = new Buffer(value.toString());
    writer.write('$' + b.length + '\r\n');
    writer.write(b);
    writer.write('\r\n');
};

// Automatic encoding. Binary safe.
var encode = function(writer, value) {
    if(Array.isArray(value)) {
        writer.write('*' + value.length + '\r\n');
        value.forEach(function(v) { bulk(writer, v); });
    } else {
        switch(typeof value) {
            case 'number':
                writer.write(':' + value + '\r\n');
                break;
            case 'boolean':
                writer.write(':' + (value ? '1':'0') + '\r\n');
                break;
            default:
                bulk(writer, value);
                break;
        }
    }
};

// An error.
var error = function(writer, msg) {
    writer.write('-' + msg + '\r\n');
};

// A simple response.
var singleline = function(writer, line) {
    writer.write('+' + line + '\r\n');
};

module.exports = {
    encode: encode,
    error: error,
    singleline: singleline
};
