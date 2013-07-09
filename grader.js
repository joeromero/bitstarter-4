#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + restler
   - https://github.com/danwrong/restler

 + when
   - https://github.com/cujojs/when

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/

var fs = require("fs");
var commander = require("commander");
var restler = require("restler");
var cheerio = require("cheerio");
var when = require("when");
//var HTMLFILE_DEFAULT = "index.html";
var HTMLFILE_DEFAULT = "README.md";
var CHECKSFILE_DEFAULT = "checks.json";

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlContent = function(htmlcontent) {
    return cheerio.load(htmlcontent);
};

var checkHtmlContent = function(htmlcontent, checks) {
    $ = cheerioHtmlContent(htmlcontent);
    var checksSort = checks.sort();
    var out = {};
    for(var ii in checksSort) {
        var present = $(checksSort[ii]).length > 0;
        out[checksSort[ii]] = present;
    }
    return out;
};

var clone = function(fn) { // Workaround for commander.js issue. // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var when_getHtmlContentFromUrl = function( url ) {
  var deferred = when.defer();

  restler.get( url ).on( "complete", function( result ) {
    deferred.resolve( result );
  });

  return deferred.promise;
}

var getHtmlContentFromFile = function( htmlfile ) {
  return fs.readFileSync(htmlfile);
}

var getJsonContentFromFile = function( checksfile ) {
    return JSON.parse( fs.readFileSync(checksfile) );
};

var checkAndLog = function( htmlContent, checksJsonConten ) {
    var checkJson = checkHtmlContent( htmlContent, checksJsonConten );
    var outJson = JSON.stringify(checkJson, null, 4);
    //console.log( htmlContent );
    console.log( outJson );
}

if( require.main == module ){
    commander
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
        .option('-u, --url <html_file>', 'Url to html page')
        .parse(process.argv);

    var checkJson,outJson;
    if( commander.url ){
      when_getHtmlContentFromUrl( commander.url ).then( function( result ){
        checkAndLog( 
          result, 
          getJsonContentFromFile( commander.checks ) );
      } );

    } else {
      checkAndLog( 
        getHtmlContentFromFile( commander.file ), 
        getJsonContentFromFile( commander.checks ) );
    }

} else {
    exports.checkHtmlContent = checkHtmlContent;
}
