var assert = require("assert");
var fs = require("fs");
var path = require("path");
var types = require("../lib/types");
var parse = require("../lib/parser").parse;

describe("syntax", function() {
    // Make sure we handle all possible node types in Syntax, and no additional
    // types that are not present in Syntax.
    it("Completeness", function(done) {
        var printer = path.join(__dirname, "../lib/printer.js");

        fs.readFile(printer, "utf-8", function(err, data) {
            assert.ok(!err);

            var ast = parse(data);
            assert.ok(ast);

            var typeNames = {};
            types.visit(ast, {
                visitFunctionDeclaration: function(path) {
                    var decl = path.node;
                    if (types.namedTypes.Identifier.check(decl.id) &&
                        decl.id.name === "genericPrintNoParens") {
                        this.traverse(path, {
                            visitSwitchCase: function(path) {
                                var test = path.node.test;
                                if (test &&
                                    test.type === "Literal" &&
                                    typeof test.value === "string") {
                                    var name = test.value;
                                    typeNames[name] = name;
                                }
                                return false;
                            }
                        });
                    } else {
                        this.traverse(path);
                    }
                }
            });

            for (var name in types.namedTypes) {
                if (types.namedTypes.hasOwnProperty(name)) {
                    assert.ok(typeNames.hasOwnProperty(name), "unhandled type: " + name);
                    assert.strictEqual(name, typeNames[name]);
                    delete typeNames[name];
                }
            }

            done();
        });
    });
});
