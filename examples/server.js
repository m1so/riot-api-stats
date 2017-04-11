const express = require('express')
const path = require('path')
const zmq = require('zmq')
const uuid = require('uuid/v4')

// Load the environment variables
require('dotenv').config()

// ZeroMQ pipeline
const sender = zmq.socket('push')

sender.bind(`tcp://127.0.0.1:${process.env.ZEROMQ_SENDER_PORT}`, (err) => {
  if (err) throw err
  console.log('ZMQ sender bound!')
})

const receiver = zmq.socket('pull')

receiver.bind(`tcp://127.0.0.1:${process.env.ZEROMQ_RECEIVER_PORT}`, (err) => {
  if (err) throw err
  console.log('ZMQ receiver bound!')
})

receiver.on('message', (data) => {
  console.log(' Received data, sending sockets')
  data = JSON.parse(data)
  io.emit('stats', data)
})

const msg = (summonerId, region) => {
  return JSON.stringify({
    summonerId,
    region,
    id: uuid(),
  })
}

// Express and Socket.io server
const app = express()

const server = app.listen(process.env.SERVER_PORT || 3000, () => {
  console.log('Example app listening on port 3000!')
})

const io = require('socket.io')(server) // eslint-disable-line

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

// TODO: Change to post
app.get('/update/stats/:region/:summonerId', (req, res) => {
  console.log(' Requesting...')

  sender.send(msg(req.params.summonerId, req.params.region))

  res.send('Sent to worker')
})
