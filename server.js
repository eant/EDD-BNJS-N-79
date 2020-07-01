const express = require('express')
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')
const server = express()

const urlencoded = express.urlencoded({ extended : true })
const json = express.json()

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => {

    const client = await MongoClient.connect(url, { useUnifiedTopology : true })

    DB = await client.db("MercadoTECH")

}

let DB = null

connectDB()

server.use( json )
server.use( urlencoded )
server.listen(3000)

server.get("/api", async (req, res) => { //<-- Obtener los datos

    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()
    
    res.json( resultado )
})

server.get("/api/:id", async (req, res) => {
    const productos = await DB.collection('Productos')
    
    const ID = req.params.id

    const query = { "_id" : ObjectId(ID) }
    
    const resultado = await productos.find( query ).toArray()

    res.json( resultado )
})

server.post("/api", async (req, res) => { //<-- Crear con datos
    /*
        Requisitos del ID:
        - Unico
        - Irrepetible
        - Autoasignable
    */
    const datos = req.body //<--- { nombre: "Cafe", stock: "700", precio: "85.75", disponible: "true" }
    const productos = await DB.collection("Productos")

    const { result } = await productos.insertOne( datos )

    res.json({ rta : result.ok })  
})

server.put("/api/:id", async (req, res) => { //<-- Actualizar con datos
    
    const ID = req.params.id
    const datos = req.body

    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId( ID ) }
    
    const update = {
        $set : { ...datos }
    }

    const { result } = await productos.updateOne( query, update )

    res.json({ rta : result.ok })
})

server.delete("/api", (req, res) => { //<-- Eliminar los datos
    res.json({ rta : "Acá vas a borrar productos" })
})
