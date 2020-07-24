import express from 'express'
import hbs from 'express-handlebars'
const { MongoClient } = require('mongodb')
const { ObjectId } = require('mongodb')
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const expressFileupload = require("express-fileupload")
const server = express()

const urlencoded = express.urlencoded({ extended : true })
const json = express.json()
const staticDir = express.static(__dirname + "/public")
const cookies = cookieParser()
const fileUpload = expressFileupload()

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@${process.env.MONGODB_HOST}/${process.env.MONGODB_BASE}?retryWrites=true&w=majority`

const connectDB = async () => {

    const client = await MongoClient.connect(url, { useUnifiedTopology : true })

    return await client.db("MercadoTECH")

}

const port = process.env.PORT || 3000

const base_url = req => req.protocol + "://" + req.hostname + ":" + port

server.use( json )
server.use( urlencoded )
server.use( cookies )
server.use( fileUpload )

server.set("view engine", "handlebars")
server.engine("handlebars", hbs() )

server.use("/", staticDir )
server.listen(port)

const verifyToken = (req, res, next) => {
    //aca hay que verificar el token...
    const token = req.cookies._auth

    jwt.verify(token, process.env.JWT_PASSPHRASE, (error, data) => {
        if(error){
            res.redirect( base_url(req) + "/admin/ingresar")
        } else {
            // ↓ Acá desencripto el JWT y accedo a los datos...
            req.user = data.usuario
            next()
        }
    })
}

// Inicio Rutas del Dashboard //
server.get("/admin", verifyToken, async (req, res) => {

    const msg = req.query.msg

    const msgStyle = msg == "ok" ? "alert-success" : "alert-danger"
    const msgText = msg == "ok" ? "Operación realizada correctamente!" : "La operación no pudo completarse..."

    const DB = await connectDB()

    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()

    res.render("panel", {
        url : base_url(req), //<-- http://localhost:3000
        items : resultado,
        msg,
        msgStyle,
        msgText
    }) 

})

server.get("/admin/nuevo", verifyToken, (req, res) => {
    res.render("formulario", {
        url : base_url(req),
        accion : "Nuevo",
        metodo : "POST"
    })
})

server.get("/admin/editar/:id", verifyToken, async (req, res) => {
    /* OBTENER EL PRODUCTO A EDITAR */
    const ID = req.params.id
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    const query = { "_id" : ObjectId(ID) }
    const resultado = await productos.find( query ).toArray()
    //////////////////////////////////
    res.render("formulario", {
        url : base_url(req),
        accion : "Actualizar",
        metodo : "PUT",
        ...resultado[0]
    })
})

server.get("/admin/ingresar", (req, res) => {
    res.render("login", { url : base_url(req) })
})
// Fin de Rutas del Dashboard //

////////////// API REST //////////////

server.get("/api", async (req, res) => { //<-- Obtener los datos
    const DB = await connectDB()
    const productos = await DB.collection('Productos')
    const resultado = await productos.find({}).toArray()
    
    res.json( resultado )
})

server.get("/api/:id", async (req, res) => {
    const DB = await connectDB()
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
    const imagen = req.files.imagen
    const datos = req.body
    
    const DB = await connectDB()
    const productos = await DB.collection("Productos")

    const producto = { ...datos, imagen : imagen.name }   //<--- { nombre: "iPhone X", stock: "700", precio: "985.75", marca: "Apple", detalle : "lalalall", imagen : "iphone_x.jpg" }

    const ubicacion = __dirname + "/public/productos/" + imagen.name

    imagen.mv(ubicacion, error => {
        if(error){
            console.log("No se movio")
            console.log(error)
        }
    })

    const { result } = await productos.insertOne( producto )

    res.json({ rta : result.ok })  
})

server.put("/api/:id", async (req, res) => { //<-- Actualizar con datos
    
    const ID = req.params.id
    const datos = req.body
    const DB = await connectDB()
    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId( ID ) }
    
    console.log(datos)

    const update = {
        $set : { ...datos }
    }

    const { result } = await productos.updateOne( query, update )

    res.json({ rta : result.ok })
})

server.delete("/api/:id", async (req, res) => { //<-- Eliminar los datos
    const ID = req.params.id
    const DB = await connectDB()
    const productos = await DB.collection("Productos")

    const query = { "_id" : ObjectId(ID) }

    const result  = await productos.findOneAndDelete( query )
    
    res.json({ rta : result.ok })
})

////////////// JWT Login //////////////
server.post("/login", (req, res) => {

    const datos = req.body

    if( datos.email == "pepito@gmail.com" && datos.clave == "pepito" ){

        const duracion = 15 //<-- Minutos
        const vencimientoTimestamp = Date.now() + (60 * 1000 * duracion) //<--- Dentro de 5 minutos
        const vencimientoFecha = new Date( vencimientoTimestamp ) 
        
        const token = jwt.sign({ usuario : datos.email, expiresIn : (duracion * 60) }, process.env.JWT_PASSPHRASE)
        
        res.cookie("_auth", token, { expires : vencimientoFecha, httpOnly : true, sameSite : "Strict", secure : false })

        res.redirect( base_url(req) + "/admin" )

    } else {
        res.json({ rta : "Datos incorrectos" })
    }

})