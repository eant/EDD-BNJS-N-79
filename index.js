const express = require('express')
const server = express()

const public = express.static("public")
const urlencoded = express.urlencoded({ extended : false })
const json = express.json()

server.use( public ) //<-- Middleware
server.use( urlencoded )
server.use( json )
 
server.post('/enviar', function (request, response) {
    const datos = request.body

    console.log("Estos son los datos enviados:")
    console.log( datos )
    
    response.json({ rta : "ok" })
})
 
server.listen(3000)