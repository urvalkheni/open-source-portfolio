import Button from "../ui/Button";
import Modal from "./Modal";

function ConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}) {
  return (
    <Modal isOpen={isOpen} title={title} description={description} onClose={onClose}>
      <div className="confirm-modal">
        <p>This action updates your browser-stored dashboard immediately.</p>
        <div className="contribution-form__actions">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
