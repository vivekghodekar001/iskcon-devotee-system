import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface Props {
    title: string;
    message: string;
    onClose: () => void;
}

const SuccessModal: React.FC<Props> = ({ title, message, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content p-8 text-center" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    <X size={20} />
                </button>

                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="text-green-600" size={32} />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{message}</p>

                <button onClick={onClose} className="btn-divine px-8">
                    Got it
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
