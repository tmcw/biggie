#!/usr/bin/env node

var concat = require('concat-stream'),
    fs = require('fs'),
    mustache = require('mustache'),
    argv = require('minimist')(process.argv.slice(2)),
    marked = require('marked');

if (process.stdin.isTTY && !argv._[0]) {
    process.stdout.write(fs.readFileSync(__dirname + '/HELP.md'));
    process.exit(1);
}

(argv._.length ? fs.createReadStream(argv._[0]) : process.stdin).pipe(concat(convert));

function convert(data) {
    var divs = data.toString().split('---').filter(function(v) {
        return v.replace(/\s/g, '');
    }).map(function(v) {
        return '<div>' + marked(v) + '</div>';
    }).join('\n');

    process.stdout.write(mustache.render(
        fs.readFileSync(__dirname + '/js/template.hbs', 'utf8'), {
        title: 'Foo',
        slides: divs,
        style: fs.readFileSync(argv.style || (__dirname + '/js/style/classic.hbs'))
    }));
}
