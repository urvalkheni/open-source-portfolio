import { useEffect, useState } from "react";
import Button from "../ui/Button";

function AdminLoginForm({ onSubmit, onCancel, isSubmitting, errorMessage }) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!isSubmitting && !errorMessage) {
      setPin("");
    }
  }, [errorMessage, isSubmitting]);

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(pin);
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <label className="contribution-form__field contribution-form__field--full">
        <span>Admin PIN</span>
        <input
          className="form-control"
          type="password"
          name="pin"
          value={pin}
          onChange={(event) => setPin(event.target.value)}
          autoComplete="current-password"
          placeholder="Enter admin PIN"
        />
        {errorMessage ? <small>{errorMessage}</small> : null}
      </label>

      <div className="contribution-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !pin.trim()}>
          {isSubmitting ? "Checking..." : "Unlock admin mode"}
        </Button>
      </div>
    </form>
  );
}

export default AdminLoginForm;
