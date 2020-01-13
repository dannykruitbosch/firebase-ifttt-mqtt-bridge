const f = require('firebase-functions');
const mqtt = require('mqtt')
const uuid = require('uuid/v4')

/*
Configuration:
You will have to configure a handful of firebase config vars.
  firebase functions:config:set mqtt.server.port=12345
  firebase functions:config:set mqtt.server.host=mqtt://mxx.cloudmqtt.com
  firebase functions:config:set mqtt.server.user=username
  firebase functions:config:set mqtt.server.password=password
  firebase functions:config:set access.api_key=secretapikey
*/

exports.post = f.https.onRequest((req, res)=> {

    //Check if API key is correct
    if (f.config().access.api_key !== req.body.key) {
        console.log("API key not valid")
        res.send("404 Error")
        return
    }

    const options = {
        port: f.config().mqtt.server.port,
        host: f.config().mqtt.server.host,
        clientId: uuid(),
        username: f.config().mqtt.server.user,
        password: f.config().mqtt.server.password,
        keepalive: 60,
        reconnectPeriod: 1000,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        encoding: 'utf8'
    }

    // setup a MQTT connection
    const client = mqtt.connect(f.config().mqtt.server.host, options)
    var topic = req.body.topic
    var message = req.body.message

    client.on('connect', () => {
        console.log('client connected')
    })

    client.on('error', (err) => {
        console.error(err)
    })

    console.log(`topic: ${topic}`)
    console.log(`message: ${message}`)

    client.publish(topic, message, (err) => {
        if (err) {
            console.log(`Error publishing message: ${err}`)
            res.send(`Errors sending message: ${err}`)
        }

        res.send(`Published message: ${message} to topic: ${topic}`)
        client.end()
    })
})
