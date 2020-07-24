import React from 'react'

const Menu = props => {
    return(
        <ul className="list-group">
            { props.items.map( item => <li className="list-group-item text-center" key={item.id}>{item.nombre}</li> ) }
        </ul>
    )
}

export default Menu