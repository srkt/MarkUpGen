/// <reference path="../../Scripts/jasmine/jasmine.js" />
/// <reference path="~/Scripts/bin/HtmlGenerator.js" />

var HtmlGenerator = require('../dist/HtmlGenerator.js');
describe('Html generator tests', function () {


    var htmlgen, pattern, tempelem = 'div.temp-elem@style=display:none;', pholder = {
        '1': ['.a>.b#c+(.d>.e)*2', '.a>.b#c+.d>.e^' + tempelem + '+.d>.e^' + tempelem],
        '2': ['.a>.b#c+(.d>.e>#f>(.h@i=j)*2)*2', '.a>.b#c+.d>.e>#f>.h@i=j+.h@i=j^^^'+tempelem +'+.d>.e>#f>.h@i=j+.h@i=j^^^'+tempelem]
    };
    


    beforeEach(function () {
        console.log(HtmlGenerator);
        htmlgen = HtmlGenerator('.row');
        pattern = ".a>.b#c+(.d>.e>#f>(.h@i=j)*2)*2";
    });

    it('flattenpattern check', function() {
        expect(htmlgen).not.toBeUndefined();
        var result = htmlgen.flattenPattern(pholder[2][0]);
        expect(result).toEqual(pholder[2][1]);
    });

    afterEach(function () {

    });


});