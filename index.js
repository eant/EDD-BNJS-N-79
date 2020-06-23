const express = require('express')
const multer = require('multer')
const joi = require("@hapi/joi")
const nodemailer = require("nodemailer")
const server = express()

const public = express.static("public")
const urlencoded = express.urlencoded({ extended : true })
const json = express.json()
const upload = multer()

const schemaContact = joi.object({
    nombre : joi.string().min(4).max(25).required(),
    correo : joi.string().email({
        minDomainSegments: 2,
        tlds: {
            allow: ['com', 'net', 'org']
        }
    }).required(),
    asunto : joi.string().alphanum().valid("ax14", "ax38", "ax45", "ax67").required(),
    mensaje : joi.string().min(10).max(100).required()
})

//1) Crear la conexion con el Servidor de Email
const miniOutlook = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

//2) Verificar la conexion con el Servidor de Email
miniOutlook.verify((error, ok) => {
        error ? console.log("AAAHHHHH!!!") : console.log("Tudo bom, Tudo legal...")
})

server.use( json )
server.use( urlencoded )
server.use( upload.array() )
server.use( public ) //<-- Middleware
 
server.post('/enviar', function (request, response) {
    const datos = request.body //<-- Ya vien, tiene todo para funcar...

    console.log("Estos son los datos enviados:")
    console.log( datos )

    const validacion = schemaContact.validate( datos )

    console.log(validacion.error)

    if( validacion.error ){

        response.json({ rta : "error", details : validacion.error.details  })

    } else { //<-- Si los datos son validos... hacer magia
        
        miniOutlook.sendMail({
            from : datos.correo,
            to : "smessina5@gmail.com",
            replyTo :  datos.correo,
            subject : "Consulta desde NodEANT",
            html : `
                <p style="color:grey">Datos del contacto:</p>
                <p>Nombre: ${datos.nombre}</p>
                <p>Email: ${datos.correo}</p>
                <p>Mensaje:</p>
                <blockquote>${datos.mensaje}</blockquote>
                `
        }, function(error, info){
            const rta = error ? "Su consulta no pudo ser enviada" : "Gracias por su consulta :D"
            
            response.json({ rta })
        })
        

    }
    
})
 
server.listen(3000)