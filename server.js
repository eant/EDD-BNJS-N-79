const express = require('express')
const { MongoClient } = require('mongodb')
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

server.get("/api/:id", (req, res) => {
    res.end(`El producto a buscar por :id es: ${req.params.id}`)
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

server.put("/api", (req, res) => { //<-- Actualizar con datos
    const datos = req.body

    const encontrado = DB.find(item => item.id == datos.id)
    encontrado.stock = datos.stock

    res.json({ rta : "ok" })
})

server.delete("/api", (req, res) => { //<-- Eliminar los datos
    res.json({ rta : "Acá vas a borrar productos" })
})
