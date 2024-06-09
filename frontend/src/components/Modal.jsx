import React from 'react';
import "../styles/Modal.css"

const Modal = ({ show, title, message, onClose }) => {
    if (!show) return null;
    function formatMessage(){
        let regexW = /\bw\b/g;
        let regexB = /\bb\b/g;
        return message.replace(regexW, "White").replace(regexB, "Black");
    }
    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2 className='modal-title'>{title}</h2>
                <p className='modal-text'>{formatMessage(message)}</p>
                <button onClick={onClose} className='modal-button'>Close</button>
            </div>
        </div>
    );
};

export default Modal;
