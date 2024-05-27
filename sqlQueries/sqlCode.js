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
  s.end_date < DATE('now')
  AND s.id_user = ${userId}

    `;
};

exports.getCurrentStaysQuery = (userId) => {
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
  s.start_date < DATE('now') AND s.end_date > DATE('now')
  AND s.id_user = ${userId}

    `;
};

exports.getComingStaysQuery = (userId) => {
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
  s.start_date > DATE('now')
  AND s.id_user = ${userId}

    `;
};

exports.getDoctorsQuery = () => {
  return `SELECT id_doctor, last_name, name, specialty FROM Doctors`;
};

exports.getUsersQuery = () => {
  return `SELECT last_name, name, id_user FROM Users`;
};

exports.getStayQuery = () => {
  return `SELECT id_stay, start_date, id_user FROM Stay`;
};

exports.getEntryQuery = () => {
  return `
      SELECT id_stay, id_user, user_name, start_date, end_date, stay_reason, doctor_specialty, doctor_name
      FROM Stay 
      WHERE start_date = DATE('now')
  `;
};

exports.getExitQuery = () => {
  return `
      SELECT id_stay, id_user, user_name, start_date, end_date, stay_reason, doctor_specialty, doctor_name 
      FROM Stay 
      WHERE end_date = DATE('now')
  `;
};

exports.getUserInfoQuery = (userId, stayId) => {
  return `SELECT 
  u.last_name, 
  u.name, 
  u.mail, 
  u.postal_adress,
  c.description AS consultation_description,
  p.medicament_name,
  p.posology,
  p.start_date AS prescription_start_date,
  p.end_date AS prescription_end_date
FROM 
  users u
  LEFT JOIN Consultations c ON u.id_user = c.id_user AND c.id_stay = ${stayId}
  LEFT JOIN Prescription p ON u.id_user = p.id_user AND p.id_stay = ${stayId}
WHERE 
  u.id_user = ${userId};`;
};
