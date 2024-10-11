import React from 'react'
import RedTile from '../../../assets/Colores/A.svg';
import YellowTile from '../../../assets/Colores/B.svg';
import GreenTile from '../../../assets/Colores/C.svg';
import BlueTile from '../../../assets/Colores/D.svg';

const images = {
    red: RedTile,
    yellow: YellowTile,
    green: GreenTile,
    blue: BlueTile,
};

export const Ficha = ({ color, onClick }) => {
    const tileImage = images[color];

    return (
        <div className="celda" onClick={onClick}>
            <img className="h-auto max-w-full" src={tileImage} alt={`${color}`} />
        </div>
    )
}

export default Ficha;