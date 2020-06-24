const express = require('express')
const server = express()

const urlencoded = express.urlencoded({ extended : true })
const json = express.json()

const DB = []

server.use( json )
server.use( urlencoded )
server.listen(3000)

server.get("/api", (req, res) => { //<-- Obtener los datos
    res.json( DB )
})

server.post("/api", (req, res) => { //<-- Crear con datos
    const datos = req.body

    DB.push( datos )

    res.json({ rta : "ok" })  
})

server.put("/api", (req, res) => { //<-- Actualizar con datos
    res.json({ rta : "Acá vas a actualizar productos" })
})

server.delete("/api", (req, res) => { //<-- Eliminar los datos
    res.json({ rta : "Acá vas a borrar productos" })
})
