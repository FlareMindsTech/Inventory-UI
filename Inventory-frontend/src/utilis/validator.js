// Reusable validator functions — each takes a value and returns
// an error message string, or "" if valid.

export const required = (message = "This field is required") => (value) =>
  !value || !String(value).trim() ? message : "";

export const minLength = (min, message) => (value) =>
  value && value.length < min
    ? message || `Must be at least ${min} characters`
    : "";

export const email = (message = "Enter a valid email address") => (value) =>
  value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : "";

export const phone = (message = "Enter a valid phone number") => (value) =>
  value && !/^\+?[0-9]{10,15}$/.test(value.replace(/[\s-]/g, ""))
    ? message
    : "";

export const username = (message = "Only letters, numbers, dots, underscores") => (
  value
) => (value && !/^[a-zA-Z0-9._]{3,20}$/.test(value) ? message : "");

export const strongPassword = (
  message = "Must be at least 6 characters and include uppercase, lowercase, number, and special character"
) => (value) => {
  if (!value) return "";
  const hasMinLength = value.length >= 6;
  const hasUpper = /[A-Z]/.test(value);
  const hasLower = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSpecial = /[^A-Za-z0-9]/.test(value);

  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial
    ? ""
    : message;
};

// Runs an array of validators for a single value, returns first error found
export const runValidators = (value, validatorList = []) => {
  for (const validate of validatorList) {
    const error = validate(value);
    if (error) return error;
  }
  return "";
};
export const minLengthText = (min, message) => (value) =>
  value && value.trim().length < min
    ? message || `Must be at least ${min} characters`
    : "";

export const positiveNumber = (message = "Must be a positive number") => (
  value
) => (value !== "" && (isNaN(value) || Number(value) <= 0) ? message : "");

export const nonNegativeNumber = (message = "Cannot be negative") => (value) =>
  value !== "" && (isNaN(value) || Number(value) < 0) ? message : "";

export const maxNumber = (max, message) => (value) =>
  value !== "" && Number(value) > max
    ? message || `Cannot be more than ${max}`
    : "";

export const positiveInteger = (message = "Must be a whole number greater than 0") => (
  value
) =>
  value !== "" && (!Number.isInteger(Number(value)) || Number(value) <= 0)
    ? message
    : "";