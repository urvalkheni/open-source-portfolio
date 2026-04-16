import { useEffect, useState } from "react";
import {
  validateContributionInput,
} from "../../services/validationService";
import Button from "../ui/Button";
import { sanitizePlainText } from "../../services/securityService";
import { STATUS_OPTIONS } from "../../services/validationService";

const emptyValues = {
  project: "",
  title: "",
  description: "",
  status: "Approved",
  impact: "",
  learnings: "",
  area: "",
  link: "",
  date: "",
};

function ContributionForm({ initialValues, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    ...emptyValues,
    ...(initialValues ?? {}),
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues({ ...emptyValues, ...(initialValues ?? {}) });
    setErrors({});
  }, [initialValues]);

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({
      ...currentValues,
      [name]:
        name === "date" || name === "status"
          ? value
          : sanitizePlainText(value, {
              multiline: ["description", "impact", "learnings"].includes(name),
              maxLength:
                name === "title"
                  ? 140
                  : name === "project" || name === "area"
                    ? 80
                    : name === "description"
                      ? 600
                      : name === "impact"
                        ? 420
                        : name === "learnings"
                          ? 700
                          : 500,
            }),
    }));
  }

  function validate() {
    const { errors: nextErrors, sanitized } = validateContributionInput(values);

    setValues((currentValues) => ({
      ...currentValues,
      ...sanitized,
    }));

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const { sanitized } = validateContributionInput(values);

    onSubmit(sanitized);
  }

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <div className="contribution-form__grid">
        <label className="contribution-form__field">
          <span>Project name</span>
          <input
            className="form-control"
            name="project"
            value={values.project}
            onChange={handleChange}
            placeholder="Suricata"
            maxLength={80}
          />
        </label>

        <label className="contribution-form__field">
          <span>Status</span>
          <select
            className="form-control"
            name="status"
            value={values.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="contribution-form__field contribution-form__field--full">
          <span>Title</span>
          <input
            className="form-control"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="DNS parser hardening for malformed edge cases"
            maxLength={140}
          />
          {errors.title ? <small>{errors.title}</small> : null}
        </label>

        <label className="contribution-form__field contribution-form__field--full">
          <span>Description</span>
          <textarea
            className="form-control form-control--multiline"
            name="description"
            value={values.description}
            onChange={handleChange}
            rows={4}
            placeholder="Summarize the engineering change."
            maxLength={600}
          />
        </label>

        <label className="contribution-form__field contribution-form__field--full">
          <span>Impact</span>
          <textarea
            className="form-control form-control--multiline"
            name="impact"
            value={values.impact}
            onChange={handleChange}
            rows={3}
            placeholder="Explain why this contribution matters."
            maxLength={420}
          />
        </label>

        <label className="contribution-form__field contribution-form__field--full">
          <span>Learnings</span>
          <textarea
            className="form-control form-control--multiline"
            name="learnings"
            value={values.learnings}
            onChange={handleChange}
            rows={4}
            placeholder="What did you learn from this contribution?"
            maxLength={700}
          />
        </label>

        <label className="contribution-form__field">
          <span>Area</span>
          <input
            className="form-control"
            name="area"
            value={values.area}
            onChange={handleChange}
            placeholder="Protocol Analysis"
            maxLength={80}
          />
        </label>

        <label className="contribution-form__field">
          <span>Date</span>
          <input
            className="form-control"
            type="date"
            name="date"
            value={values.date}
            onChange={handleChange}
          />
        </label>

        <label className="contribution-form__field contribution-form__field--full">
          <span>PR Link</span>
          <input
            className="form-control"
            name="link"
            value={values.link}
            onChange={handleChange}
            placeholder="https://github.com/org/repo/pull/123"
            inputMode="url"
          />
          {errors.link ? <small>{errors.link}</small> : null}
        </label>

        {errors.status ? (
          <div className="contribution-form__field contribution-form__field--full">
            <small>{errors.status}</small>
          </div>
        ) : null}

        {errors.date ? (
          <div className="contribution-form__field contribution-form__field--full">
            <small>{errors.date}</small>
          </div>
        ) : null}
      </div>

      <div className="contribution-form__actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save contribution</Button>
      </div>
    </form>
  );
}

export default ContributionForm;
