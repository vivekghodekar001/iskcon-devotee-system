import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    duration?: number; // Auto close after ms
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    onClose,
    title = 'Success!',
    message,
    duration
}) => {

    useEffect(() => {
        if (isOpen && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95 duration-300 border border-teal-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce-slow">
                    <Check size={40} strokeWidth={3} />
                </div>

                <h3 className="text-2xl font-bold text-slate-900 font-serif mb-2">{title}</h3>
                <p className="text-slate-500 mb-6 leading-relaxed">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-[#0F766E] text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 active:scale-95 transition-all"
                >
                    Continue
                </button>
            </div>
        </div>
    );
};

export default SuccessModal;
