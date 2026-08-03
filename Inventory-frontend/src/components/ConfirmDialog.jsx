import Modal from "./Modal";
import Button from "./Button";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="text-sm text-brand-400 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <button
          onClick={onConfirm}
          className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg py-2.5 text-sm font-medium transition-transform active:scale-[0.98]"
        >
          Delete
        </button>
      </div>
    </Modal>
  );
}