var request = require('request')
var fs = require('fs')
var extend = require('util-extend')
var duplexify = require('duplexify')
var through = require('through2')

// Caution!
// // https://dev.twitter.com/overview/api/twitter-ids-json-and-snowflake
var ENDPOINT = 'https://upload.twitter.com/1.1/media/upload.json'

function twitterVideo (oauth, total_bytes) {
  var media_id
  var dup = duplexify()
  var oauthReq = {
    consumer_key: oauth.consumer_key,
    consumer_secret: oauth.consumer_secret,
    token: oauth.access_token,
    token_secret: oauth.access_token_secret
  }

  var baseReq = {
    url: ENDPOINT,
    oauth: oauthReq,
    json: true
  }

  dup.once('pipe', initialRequest)

  function initialRequest () {
    var initReq = extend({
      formData: {
        media_type: 'video/mp4',
        command: 'INIT',
        total_bytes: total_bytes || 15000000
      }
    }, baseReq)
    request.post(initReq, initCb)
  }

  function initCb (err, res, body) {
    if (err) return dup.destroy(err)
    media_id = body.media_id_string
    dup.setWritable(appendStream(media_id, baseReq, finalRequest))
  }

  function finalRequest (cb) {
    var finalReq = extend({
      formData: {
        command: 'FINALIZE',
        media_id: media_id
      }
    }, baseReq)
    request.post(finalReq, function (err, res, body) {
      if (err) return cb(err)
      dup.emit('media_id', media_id)
      return cb()
    })
  }

  return dup
}

function counter () {
  var i = 0
  return function aCounter () {
    return i++
  }
}

function appendStream (media_id, baseReq, flush) {
  var c = counter()
  var append = through(write, flush)
  var appendReq = extend({ formData: {
      command: 'APPEND',
      media_id: media_id
    }
  }, baseReq)

  function write (chunk, enc, next) {
    appendReq.formData.segment_index = c()
    appendReq.formData.media = chunk
    request.post(appendReq, function append (err, res, body) {
      next(err)
    })
  }

  return append
}

function fromFile (path, oauth, cb) {
  fs.stat(path, function (err, stats) {
    if (err) return cb(err)
    var fileSize = stats.size
    var fileStream = fs.createReadStream(path)
    var videoStream = twitterVideo(oauth, fileSize)
    videoStream.on('error', function streamError (err) {
      return cb(err)
    })
    videoStream.on('finish', function finalize () {
      videoStream.on('media_id', function (media_id) {
        return cb(null, media_id)
      })
    })
    fileStream.pipe(videoStream)
  })
}

twitterVideo.fromFile = fromFile
module.exports = twitterVideo
