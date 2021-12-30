// Validation
export interface Validate {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate({
  required,
  value,
  minLength,
  maxLength,
  max,
  min,
}: Validate): boolean {
  let isValid = true;
  if (required) {
    isValid = isValid && value.toString().trim().length > 0;
  }
  if (minLength != null && typeof value === "string") {
    isValid = isValid && value.length >= minLength;
  }
  if (maxLength != null && typeof value === "string") {
    isValid = isValid && value.length <= maxLength;
  }
  if (min != null && typeof value === "number") {
    isValid = isValid && value >= min;
  }
  if (max != null && typeof value === "number") {
    isValid = isValid && value <= max;
  }
  return isValid;
}
