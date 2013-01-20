var excludeFieldConfig = {
    type: 'type',
    id: 'vk_audio_exclude',
    placeholder: 'Exclude',
    style: ''
};

function getEl(selector, container){
    var parent = container || document;
    var el = parent.querySelectorAll(selector);
    return el.length === 1 ? el[0] : el;
};

function toArray(list){
    return Array.prototype.slice.call(list);
};

function trim(str){
    return str
        .replace(/^\s*/, '')
        .replace(/\s*$/, '');
};

function trimTags(str){
    return str.replace(/(<([^>]+)>)/ig, '');
};


// TODO: finish CSS

function createExcludeField(config){
    var field = document.createElement('input');
    for ( var param in config ) {
        field[param] = config[param];
    }
    getEl('#audio_search > .fl_l:first-child')
        .parentNode
        .appendChild(field);
    return field;
};

function bindFieldEvents(field){
    var is_on_timer = false;
    var timer;
    field.addEventListener('keyup', function(event){
        if ( is_on_timer ) {
            clearTimeout(timer);
        }
        is_on_timer = true;
        timer = setTimeout(function(){
            is_on_timer = false;
            var value = trim(field.value);
            if ( field.dataset.previous !== value ) {
                field.dataset.previous = value;
                var expressions = parseQuery(value);
                console.log(
                    'Exclude "'
                    + expressions.performer.join(', ')
                    + '" from performer name and "'
                    + expressions.song.join(', ')
                    + '" from song name'
                );
                filterSongs(expressions);
            }
        }, 500);
    });
};

function initialize(){
    var field = createExcludeField(excludeFieldConfig);
    bindFieldEvents(field);
};

function filterSongs(expressions){
    toArray(getEl('.audio.fl_l')).forEach(function(songElement){
        var performer = trimTags( getEl('.title_wrap.fl_l > b > a:first-child', songElement).innerHTML );
        var song = trimTags( getEl('.title', songElement).innerHTML );
        var isAllowed = checkSong(expressions, {
            song: song,
            performer: performer
        });
        if ( !isAllowed ) {

            // TODO: finish excluding
            // TODO: exclude from DOM or from window.audioPlaylist

            songElement.style.backgroundColor = 'red'; // TODO: remove
        }
    });
};

function checkSong(expressions, data){
    for ( var param in data ) {
        for ( var i = 0, l = expressions[param].length; i < l; i++ ) {
            var regExp = new RegExp(expressions[param][i], 'i');
            if ( regExp.test(data[param].toLowerCase()) ) {
                return false;
            }
        }
    }
    return true;
};

function parseExpression(expression){
    var phrases = [];
    expression.split(/"|'/).forEach(function(str, i){
        if ( trim(str) ) {
            if ( i % 2 ) {
                phrases.push(str);
            }
            else {
                str.split(/\s+/).forEach(function(word){
                    if ( trim(word) ) {
                        phrases.push(word);
                    }
                });
            }
        }
    });
    return phrases;
};

function parseQuery(query){

    var lower = query.toLowerCase();
    var commonStopWordsRegExp = /(?:song\:)|(?:s\:)|(?:performer\:)|(?:p\:)/i;
    var stopWordsRegExp = {
        song: /(?:song\:)|(?:s\:)/ig,
        performer: /(?:performer\:)|(?:p\:)/ig
    };
    var commonExpression = lower.split(commonStopWordsRegExp)[0];
    var expressions = {
        song: [],
        performer: []
    };

    for ( var name in stopWordsRegExp ) {
        var regExp = stopWordsRegExp[name];
        while ( regExp.exec(lower) ) {
            var expression = lower
                .substr(regExp.lastIndex)
                .split(commonStopWordsRegExp)[0];
            expressions[name].push(expression);
        }
        expressions[name].push(commonExpression);
    }

    return {
        song: parseExpression(expressions.song.join(' ')),
        performer: parseExpression(expressions.performer.join(' '))
    };

};
