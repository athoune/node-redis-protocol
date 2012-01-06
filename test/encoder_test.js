var Response = require('../lib/encoder').Response;

var MockWriter = function() {
    this.reset();
};
MockWriter.prototype.reset = function() {
    this.data = '';
};
MockWriter.prototype.write = function(something) {
    this.data += something;
};

module.exports = {
    setUp: function(next) {
        this.writer = new MockWriter();
        this.response = new Response(this.writer);
        next();
    },
    'test boolean': function(test) {
        this.response.encode(true);
        test.equals(':1\r\n', this.writer.data);
        this.writer.reset();
        this.response.encode(false);
        test.equals(':0\r\n', this.writer.data);
        test.done();
    },
    'test integer': function(test) {
        this.response.encode(42);
        test.equals(':42\r\n', this.writer.data);
        test.done();
    },
    'test string': function(test) {
        this.response.encode("pépé");
        test.equals('$6\r\npépé\r\n', this.writer.data);
        test.done();
    },
    'test array': function(test) {
        this.response.encode(["a", "b"]);
        test.equals('*2\r\n$1\r\na\r\n$1\r\nb\r\n', this.writer.data);
        test.done();
    },
    'test simple': function(test) {
        this.response.singleline('OK');
        test.equals('+OK\r\n', this.writer.data);
        test.done();
    },
    'test error': function(test) {
        this.response.error('OUPS');
        test.equals('-OUPS\r\n', this.writer.data);
        test.done();
    }
};
