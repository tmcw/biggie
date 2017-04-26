var CodeMirror = require('codemirror'),
    tmpl = require('./template.hbs'),
    _ = require('underscore'),
    marked = require('marked');

var styles = {
    classic: require('./style/classic.hbs'),
    original: require('./style/original.hbs'),
    zero: require('./style/zero.hbs')
};

// load JS support for CodeMirror
// require('./markdown')(CodeMirror);

var editor = CodeMirror.fromTextArea(document.getElementById('content'), {
    mode: 'markdown',
    lineWrapping: true,
    tabSize: 2
});

var slides = document.getElementById('slides');

var style = 'original';

document.getElementById('style').onchange = function() {
    style = this.value;
    change();
};

document.getElementById('publish').onclick = publish;
var link = document.getElementById('link');
var gistlink = document.getElementById('gistlink');
var published = document.getElementById('published');

editor.on('change', _.debounce(change, 400));

function publish() {
    h = new window.XMLHttpRequest();

    h.onload = function() {
        var d = (JSON.parse(h.responseText));

        published.className = '';

        link.innerHTML = 'published at http://bl.ocks.org/d/' + d.id;
        link.href = 'http://bl.ocks.org/d/' + d.id;

        gistlink.innerHTML = 'gist src at http://gist.github.com/' + d.id;
        gistlink.href = 'http://gist.github.com/' + d.id;
    };

    h.open('POST', 'https://api.github.com/gists', true);

    h.send(JSON.stringify({
        description: 'Presentation',
        public: true,
        files: {
            'index.html': {
                content: makeSlides()
            },
            'slides.md': {
                content: editor.getValue()
            }
        }
    }));
}

function makeSlides() {
    var val = editor.getValue();

    var divs = marked(val).replace(/\<(\/)?[ph]\d?\>/g,'<$1div>');

    var page = tmpl({
        title: 'Foo',
        slides: divs,
        style: styles[style]
    });

    return page;
}

function change() {
    slides.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(makeSlides());
}

change();
