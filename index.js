const express = require('express')
const multer = require('multer')
const joi = require("@hapi/joi")
const server = express()

const public = express.static("public")
const urlencoded = express.urlencoded({ extended : true })
const json = express.json()
const upload = multer()

const schemaContact = joi.object({
    nombre : joi.string().alphanum().min(4).max(25).required(),
    correo : joi.string().email({
        minDomainSegments: 2,
        tlds: {
            allow: ['com', 'net', 'org']
        }
    }).required(),
    asunto : joi.string().alphanum().valid("ax14", "ax38", "ax45", "ax67").required(),
    mensaje : joi.string().alphanum().min(10).max(100).required()
})

server.use( json )
server.use( urlencoded )
server.use( upload.array() )
server.use( public ) //<-- Middleware
 
server.post('/enviar', function (request, response) {
    //const datos = request.body //<-- Proximamente...
    const datos = {
        nombre : "Luis Miguel",
        correo : "luis@miguel.com",
        asunto : "ax14",
        mensaje : "No culpes a la noche..."
    }

    console.log("Estos son los datos enviados:")
    console.log( datos )

    const validacion = schemaContact.validate( datos )

    if( validacion.error ){

        response.json({ rta : "error" })

    } else {

        response.json({ rta : "ok" })

    }
    
})
 
server.listen(3000)