exports.getLastStaysQuery = (userId) => {
  return `
  SELECT 
  s.start_date,
  s.end_date,
  s.stay_reason,
  s.doctor_specialty,
  s.doctor_name,
  c.description AS consultation_description,
  p.medicament_name,
  p.posology,
  p.start_date AS prescription_start_date,
  p.end_date AS prescription_end_date
FROM 
  Stay s
  LEFT JOIN Consultations c ON s.id_stay = c.id_stay
  LEFT JOIN Prescription p ON s.id_stay = p.id_stay
WHERE 
  s.start_date < DATE('now')
  AND s.id_user = ${userId}

    `;
};
