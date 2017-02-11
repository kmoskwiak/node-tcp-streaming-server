(function(){
'use strict';

var codecString = '';
/**
 *  Set to whatever codec you are using
 */

// codecString = 'video/mp4; codecs="avc1.42C028"';
codecString = 'video/webm; codecs="vp8"';
// codecString = 'video/webm; codecs="vp9"';



var video = document.getElementById('video');
var mediaSource = new MediaSource();
video.src = window.URL.createObjectURL(mediaSource);
var buffer = null;
var queue = [];

var bufferArray = [];

function updateBuffer(){
    if (queue.length > 0 && !buffer.updating) {
        buffer.appendBuffer(queue.shift());
    }
}

/**
 * Mediasource
 */
function sourceBufferHandle(){
    buffer = mediaSource.addSourceBuffer(codecString);
    buffer.mode = 'sequence';

    buffer.addEventListener('update', function() { // Note: Have tried 'updateend'
        console.log('update');
        updateBuffer();
    });

    buffer.addEventListener('updateend', function() {
        console.log('updateend');
        updateBuffer();
    });

    initWS();
}

mediaSource.addEventListener('sourceopen', sourceBufferHandle)

function initWS(){
    var ws = new WebSocket('ws://' + window.location.hostname + ':' + window.location.port, 'echo-protocol');
    ws.binaryType = "arraybuffer";

    ws.onopen = function(){
        console.info('WebSocket connection initialized');
    };

    ws.onmessage = function (event) {
        console.info('Recived WS message.', event);

        if(typeof event.data === 'object'){
            if (buffer.updating || queue.length > 0) {
                queue.push(event.data);
            } else {
                buffer.appendBuffer(event.data);
                video.play();
            }
        }
    };

}


})();