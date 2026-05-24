import React from 'react'

const Button = ({ type, name }) => {
    return (
        <button className="btn btn-primary rounded-3">{name}</button>
    )
}

export default Button