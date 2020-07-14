const express = require('express')
const hbs = require('express-handlebars')
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')
const jwt = require("jsonwebtoken")
const server = express()

const urlencoded = express.urlencoded({ extended : true })
const json = express.json()
const public = express.static(__dirname + "/public")

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => {

    const client = await MongoClient.connect(url, { useUnifiedTopology : true })

    return await client.db("MercadoTECH")

}

const port = process.env.PORT || 3000

server.use( json )
server.use( urlencoded )

server.set("view engine", "handlebars")
server.engine("handlebars", hbs() )

server.use("/", public )
server.listen(port)


// Inicio Rutas del Dashboard //
server.get("/admin", async (req, res) => {
    const DB = await connectDB()

    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()

    res.render("main", {
        layout : false,
        url : req.protocol + "://" + req.hostname + ":" + port, //<-- http://localhost:3000
        items : resultado
    }) 

})

server.get("/admin/nuevo", (req, res) => {
    res.end(`Aca hay que crear un nuevo producto`)
})

server.get("/admin/editar/:id", async (req, res) => {
    res.end(`Aca hay que editar el producto: ${req.params.id}`)
})

server.get("/admin/ingresar", (req, res) => {
    res.render("login", { layout : false })
})
// Fin de Rutas del Dashboard //

server.get("/api", async (req, res) => { //<-- Obtener los datos
    const DB = await connectDB()
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

server.delete("/api/:id", async (req, res) => { //<-- Eliminar los datos
    const ID = req.params.id

    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId(ID) }

    const result  = await productos.findOneAndDelete( query )
    
    res.json({ rta : result.ok })
})
////////////// JWT Test //////////////
const verifyToken = (req, res, next) => {
    //aca hay que verificar el token...
    const token = req.query.token

    console.log(token)

    jwt.verify(token, process.env.JWT_PASSPHRASE, (error, data) => {
        if(error){
            res.json({ rta : "Acceso no autorizado" })
        } else {
            // ↓ Acá desencripto el JWT y accedo a los datos...
            req.user = data.usuario
            next()
        }
    })
}


server.post("/login", (req, res) => {

    const datos = req.body

    if( datos.email == "pepito@gmail.com" && datos.clave == "HolaDonPepito2020" ){
        
        const token = jwt.sign({ usuario : datos.email, expiresIn : 60 }, process.env.JWT_PASSPHRASE)
        
        res.json({ rta : "Estas logeado", token })

    } else {
        res.json({ rta : "Datos incorrectos" })
    }

})

server.get("/check", verifyToken, (req, res) => {
    //Aca voy a decir si el token es valido o no...
    res.end(`Bienvenido "${req.user}"`)
})