const express = require('express')
const server = express()

const public = express.static("public")

server.use( public )
 
server.post('/enviar', function (request, response) {
  response.send('<h1>Hello Form</h1>')
})
 
server.listen(3000)