# twitter-video

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

Posts native video to twitter's video API.

## Install

```
npm install twitter-video
```

## Usage

```js
var twitterVideo = require('twitter-video')
var Twit = require('twit')

var oauth = {
  consumer_key: '123',
  consumer_secret: '123',
  access_token: '123',
  access_token_secret: '123'
}

var T = Twit(oauth)
var PATH = '/path/to/video.mp4'

twitterVideo.fromFile(PATH, oauth, function (err, media_id) {
  // Now you have a media ID you can post with a tweet
  var params = {status: 'yolo', media_ids: [ media_id ]}
  T.post('statuses/update', params, function post (err, data, res) {
    // Tweet with video is live
  })
})

var twitterStream = twitterVideo(oauth)
var videoStream = fs.createWriteStream(PATH)

twitterStream.on('finish', function() {
  twitterStream.on('media_id', function(media_id) {
    var params = {status: 'so nice i posted it twice', media_ids: [ media_id ]}
    T.post('statuses/update', params, function post (err, data, res) {
      // Tweet with video is live
    })
  })
})

videoStream.pipe(twitterStream)
```

## CLI

```
npm i -g twitter-video
```

Installing this globally gives you access to the `twitter-video` command:

```
$ twitter-video
Uploads .mp4 video to twitter with a status updates
Usage: twitter-video [options]
    --config              configure your API keys
    --video, -v           path to mp4 file e.g. '~/myVideo.mp4' (requires -s)
    --status, -s          twitter status text e.g. 'this is a tweet yolo' (requires -v)

```

Before you can post videos to twitter, you need to configure your oAuth keys.

1. Visit: https://apps.twitter.com
2. Create a new app.  This requires that a cell number is added to your twitter account.
3. Generate an access token on the "Keys and Access Tokens" tab

Next configure `twitter-video`

```
$ twitter-video --config
? Consumer Key 123
? Consumer Secret ***
? Access Token 123
? Access Token Secret ***
Attention: Secret API keys saved to /Users/username/.config/twitter-video
Ready to Send!
```

Now you can post a tweet with a native video!

```
$ twitter-video -v DRQCQaiww7XlAYJP.mp4 -s 'engage'
Post created at: https://twitter.com/twittername/status/624602234223865857
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for news and updates.

## License

[ISC](LICENSE.md)


[npm-image]: https://img.shields.io/npm/v/twitter-video.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/twitter-video
[travis-image]: https://img.shields.io/travis/bcomnes/twitter-video.svg?style=flat-square
[travis-url]: https://travis-ci.org/bcomnes/twitter-video
