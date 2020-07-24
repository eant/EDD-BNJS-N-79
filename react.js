import 'dotenv/config'
import express from 'express'
import React from 'react'
import ReactDOM from 'react-dom/server.js'
import App from './components/App.js'

const server = express()

const port = process.env.PORT || 3000

server.listen(port)

server.get("/", (req, res) => {
    
    const document = ReactDOM.renderToString( <App title="Café con React" /> )

    res.end( document )
})