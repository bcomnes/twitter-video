var request = require('request')
var fs = require('fs')
var Writable = require('stream').Writable
var extend = require('util-extend')

var ENDPOINT = 'https://upload.twitter.com/1.1/media/upload.json'

function twitterVideo (path, oauth, cb) {
  // Caution!
  // https://dev.twitter.com/overview/api/twitter-ids-json-and-snowflake
  var media_id
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

  var initReq = extend({
    formData: {
      media_type: 'video/mp4',
      command: 'INIT'
    }
  }, baseReq)

  var finalReq = extend({
    formData: {
      command: 'FINALIZE'
    }
  }, baseReq)

  fs.stat(path, function (err, stats) {
    if (err) return cb(err)
    initReq.formData.total_bytes = stats.size
    request.post(initReq, function initCb (err, res, body) {
      if (err) return cb(err)
      media_id = body.media_id_string
      finalReq.formData.media_id = media_id

      var twitAppend = twitterUpload(media_id, baseReq)
      var fileStream = fs.createReadStream(path)

      twitAppend.on('error', function streamError (err) {
        return cb(err)
      })
      twitAppend.on('finish', function finalize () {
        request.post(finalReq, function (err, res, body) {
          return cb(err, media_id)
        })
      })
      fileStream.pipe(twitAppend)
    })
  })
}

function counter () {
  var i = 0
  return function aCounter () {
    return i++
  }
}

function twitterUpload (media_id, baseReq) {
  var c = counter()
  var append = Writable()
  append._write = function write (chunk, enc, next) {
    var appendReq = extend({ formData: {
        segment_index: c(),
        command: 'APPEND',
        media_id: media_id,
        media: chunk
      }
    }, baseReq)
    console.log(appendReq)
    request.post(appendReq, function append (err, res, body) {
      next(err)
    })
  }
  return append
}

module.exports = twitterVideo
