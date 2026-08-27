import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto relative p-6">
          <button
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close modal"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-black">{title}</h2>
          <div className="prose max-w-none text-gray-800">{children}</div>
        </div>
      </div>
      <style jsx global>{`
        /* Mobile text contrast fixes for Modal */
        @media (max-width: 768px) {
          .text-black {
            color: #000000 !important;
            -webkit-text-stroke: 0.01em transparent;
          }
          .text-gray-800 {
            color: #1f2937 !important;
            -webkit-text-stroke: 0.01em transparent;
          }
          .text-gray-600 {
            color: #4b5563 !important;
            -webkit-text-stroke: 0.01em transparent;
          }
        }
      `}</style>
    </>
  );
};

export default Modal; 