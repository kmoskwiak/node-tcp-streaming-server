# Streaming Video over TCP and WebSockets with node.js

This is experimental streaming server in node.js. Ingest stream is sent over TCP to server then it is redistributed to all clients over WebSockets.

## Ingest stream
[FFMPEG](https://ffmpeg.org/) can be used to ingest  stream. In this example I use [v4l2](https://trac.ffmpeg.org/wiki/Capture/Webcam) to caputre camera on linux.
```
-f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0
```
### VP8 (using libvpx)
```
ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0  -vcodec libvpx -b:v 3500k -r 25 -crf 10 -quality realtime -speed 16 -threads 8 -an -g 25 -f webm tcp://localhost:9090
```
### H.264 (using libx264)
To stream MP4 it needs to be [ISO BMFF](https://en.wikipedia.org/wiki/ISO_base_media_file_format) compatible, so `-movflags` is set to `empty_moov+default_base_moof`.

```
ffmpeg -f v4l2 -framerate 25 -video_size 640x480 -i /dev/video0  -vcodec libx264 -profile:v main -g 25 -r 25 -b:v 500k -keyint_min 250 -strict experimental -pix_fmt yuv420p -movflags empty_moov+default_base_moof -an -preset ultrafast -f mp4 tcp://localhost:9090
```
## Stream flow

```
FFMPEG ---TCP---> NODE.JS Server -- WebSockets --> [client 0] MediaSource Video
                                |-- WebSockets --> [client 1] MediaSource Video
                                |-- WebSockets --> [client 2] MediaSource Video
```
Ingest stream is sent over TCP to node.js server. Every packet of stream is sent to clients using WebSockets. 

[MediaSource](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource) is used to retrive video stream. 

## How to use

Install
```
npm install
```

Start application
``` 
gulp 
```
In browser go to `localhost:8080`

Stream video to `tcp://localhost:9090`
```
ffmpeg (...) tcp://localhost:9090
```

According to video codec set `codecString` in `client/js/app.js` line `9` to right value.

You can customize ports in `server\app.js` lines `12` and `13`. 

## 'First packet' hack :)

There is little hack in lines `41-44` and `68-76`. Server stores beginning of stream in array which is sent to every new client. Every client will receive couple of start frames.

Without that hack video won't start for users who start watching in the middle of stream. Perhaps there is solution in better ffmpeg setting. 
