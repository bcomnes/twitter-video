var Twit = require('twit')
var twitterVideo = require('./index')
var appname = 'twitter-video'
var appCfg = require('rc')(appname, {})
var inquirer = require('inquirer')

var allowedOptions = [
  {
    name: 'config',
    boolean: true,
    help: 'configure your API keys'
  },
  {
    name: 'video',
    abbr: 'v',
    help: "path to mp4 file e.g. '~/myVideo.mp4' (requires -s)"
  },
  {
    name: 'status',
    abbr: 's',
    help: "twitter status text e.g. 'this is a tweet yolo' (requires -v)"
  }
]
var cliOpts = require('cliclopts')(allowedOptions)
var argv = require('minimist')(process.argv.slice(2), cliOpts.options())
var fs = require('fs')
var osenv = require('osenv')
var path = require('path')
var chalk = require('chalk')

function main () {
  if (argv.config) {
    var configPath = path.join(osenv.home(), '.config', appname)
    console.log('Generate your oAuth keys at https://apps.twitter.com')
    console.log('')
    var cfgQ = [
      {type: 'input',
        name: 'consumer_key',
        message: 'Consumer Key'
      },
      {
        type: 'password',
        name: 'consumer_secret',
        message: 'Consumer Secret'
      },
      {
        type: 'input',
        name: 'access_token',
        message: 'Access Token'
      },
      {
        type: 'password',
        name: 'access_token_secret',
        message: 'Access Token Secret'
      }
    ]

    inquirer.prompt(cfgQ, function (answers) {
      fs.writeFile(configPath, JSON.stringify(answers), function (err) {
        if (err) return console.error(err)
        console.log(chalk.bgRed.bold('Attention:'), 'Secret API keys saved to', configPath)
        console.log(chalk.bgGreen.bold('Ready to Send!'))
      })
    })
  } else if (argv.video && argv.status && configIsGood(appCfg)) {
    var oauth = {
      consumer_key: appCfg.consumer_key,
      consumer_secret: appCfg.consumer_secret,
      access_token: appCfg.access_token,
      access_token_secret: appCfg.access_token_secret
    }
    var T = new Twit(oauth)
    var PATH = argv.video
    var status = argv.status
    twitterVideo.fromFile(PATH, oauth, function (err, media_id) {
      if (err) throw err
      var params = {status: status, media_ids: [ media_id ]}
      T.post('statuses/update', params, function post (err, data, res) {
        if (err) return console.error(err)
        console.log('Post created at: https://twitter.com/' + data.user.screen_name + '/status/' + data.id_str)
        process.exit()
      })
    })

  } else if (argv.status && argv.status && !configIsGood(appCfg)) {
    console.log('You need to configure your API keys first')
    printHelp()
  } else {
    printHelp()
  }
}

function configIsGood (appCfg) {
  return (appCfg &&
  appCfg.hasOwnProperty('consumer_key') &&
  appCfg.hasOwnProperty('consumer_secret') &&
  appCfg.hasOwnProperty('access_token') &&
  appCfg.hasOwnProperty('access_token_secret')
  )
}

function printHelp () {
  console.log('Uploads .mp4 video to twitter with a status update')
  console.log('Usage: %s [options]', appname)
  cliOpts.print()
  process.exit()
}

module.exports = main
