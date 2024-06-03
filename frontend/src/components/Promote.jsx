import React from 'react';
import "../styles/Promote.css"

const Promote = ({ show, title, color= 'w', onClose, promote}) => {
    if (!show) return null;
    function getPiecePath(piece){
        return `/chessPieces/${color}${piece}.png`
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{title}</h2>
                <div className='modal-images'>
                    <img src={getPiecePath('b')} alt="promote" onClick={() => {
                        promote(`${color}b`)
                    }}/>
                    <img src={getPiecePath('q')} alt="promote" onClick={() => {
                        promote(`${color}q`)
                    }}/>
                    <img src={getPiecePath('r')} alt="promote" onClick={() => {
                        promote(`${color}r`)
                    }}/>
                    <img src={getPiecePath('n')} alt="promote" onClick={() => {
                        promote(`${color}n`)
                    }}/>
                </div>
                <button onClick={onClose} className='modal-btn'>Close</button>
            </div>
        </div>
    );
};

export default Promote;
