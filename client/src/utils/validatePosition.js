// Validation rules for the Create/Edit Position form
// Returns an object of field -> error message, or empty object if valid

export const validatePositionForm = (form) => {
  const errors = {};

  // Title: required, minimum 5 characters
  if (!form.title || form.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters.';
  }

  // Type: must be TA or RA
  if (!['TA', 'RA'].includes(form.type)) {
    errors.type = 'Position type must be TA or RA.';
  }

  // Course number OR research area must be provided based on type
  if (form.type === 'TA' && !form.courseNumber?.trim()) {
    errors.courseNumber = 'Course number is required for TA positions.';
  }
  if (form.type === 'RA' && !form.researchArea?.trim()) {
    errors.researchArea = 'Research area is required for RA positions.';
  }

  // Description: required, minimum 20 characters
  if (!form.description || form.description.trim().length < 20) {
    errors.description = 'Description must be at least 20 characters.';
  }

  // Requirements: required, minimum 10 characters
  if (!form.requirements || form.requirements.trim().length < 10) {
    errors.requirements = 'Requirements must be at least 10 characters.';
  }

  // Hours per week: must be between 1 and 40
  const hours = parseInt(form.hoursPerWeek, 10);
  if (isNaN(hours) || hours < 1 || hours > 40) {
    errors.hoursPerWeek = 'Hours per week must be between 1 and 40.';
  }

  // Compensation: required
  if (!form.compensation || form.compensation.trim().length === 0) {
    errors.compensation = 'Compensation details are required.';
  }

  // Deadline: must be a future date
  if (!form.deadline) {
    errors.deadline = 'Deadline is required.';
  } else {
    const deadlineDate = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight for fair comparison
    if (deadlineDate < today) {
      errors.deadline = 'Deadline must be in the future.';
    }
  }

  return errors;
};