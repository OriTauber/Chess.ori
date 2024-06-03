import React from 'react';
import "../styles/Modal.css"

const Modal = ({ show, title, message, onClose }) => {
    if (!show) return null;

    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default Modal;
