import { useState, useCallback } from "react";

/**
 * @param {Object} initialValues
 * @param {Object} rules - { fieldName: [validatorFn, validatorFn, ...] }
 */
export default function useValidation(initialValues, rules) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = useCallback(
    (field, value) => {
      const validatorList = rules[field];
      if (!validatorList) return "";
      const error = validatorList.reduce(
        (found, validate) => found || validate(value),
        ""
      );
      return error;
    },
    [rules]
  );

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));

    // live validation only after the field has been touched once
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, values[field]),
    }));
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(rules).forEach((field) => {
      newErrors[field] = validateField(field, values[field]);
    });
    setErrors(newErrors);
    setTouched(
      Object.keys(rules).reduce((acc, f) => ({ ...acc, [f]: true }), {})
    );
    return Object.values(newErrors).every((err) => !err);
  };

  const reset = (newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    setValues,
    reset,
  };
}