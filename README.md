# twitter-video

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/twitter-video.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/twitter-video
[travis-image]: https://img.shields.io/travis/bcomnes/twitter-video.svg?style=flat-square
[travis-url]: https://travis-ci.org/bcomnes/twitter-video



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

twitterVideo(PATH, oauth, function (err, media_id) {
  // Now you have a media ID you can post with a tweet
  var params = {status: 'yolo', media_ids: [ media_id ]}
  T.post('statuses/update', params, function post (err, data, res) {
    // Tweet with video is live
  })
})
```

## Contributing

Contributions welcome! Please read the [contributing guidelines](CONTRIBUTING.md) first.

## License

[ISC](LICENSE.md)
