import React from 'react'
import Menu from './Menu'

const desayuno = [
    { id : 1, nombre : "Café" },
    { id : 2, nombre : "Canela" },
    { id : 3, nombre : "Crema" },
    { id : 4, nombre : "Edulcorante" }
]

const App = props => {
    return(
        <html>
            <head>
                <meta charSet="utf-8" />
                <title>{props.title}</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.0/css/bootstrap.min.css" />
            </head>
            <body>
                <h1 className="m-3 text-center">Merienda ideal con React</h1>
                <div className="row my-3">
                    <div className="col-6 offset-3">{ <Menu items={desayuno} /> }</div>
                </div>
            </body>
        </html>
    )   
}
export default App