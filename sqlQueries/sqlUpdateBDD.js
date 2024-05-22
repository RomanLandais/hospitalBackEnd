exports.updateConsultationsQuery = () => {
  return `
      UPDATE Consultations
      SET doctor_last_name = (
        SELECT last_name 
        FROM Doctors 
        WHERE Doctors.id_doctor = Consultations.id_doctor
      ),
      doctor_name = (
        SELECT name 
        FROM Doctors 
        WHERE Doctors.id_doctor = Consultations.id_doctor
      )
      WHERE id_doctor IN (
        SELECT id_doctor 
        FROM Doctors
      );
    `;
};

exports.upgradeScheduleQuery = () => {
  return `
  UPDATE Schedule
  SET doctor_name = (
      SELECT last_name || ' ' || name
      FROM Doctors
      WHERE Doctors.id_doctor = Schedule.id_doctor
  ),
  patient_name1 = (
      SELECT last_name || ' ' || name
      FROM Users
      WHERE Users.id_user = Schedule.id_patient1
  ),
  patient_name2 = (
      SELECT last_name || ' ' || name
      FROM Users
      WHERE Users.id_user = Schedule.id_patient2
  ),
  patient_name3 = (
      SELECT last_name || ' ' || name
      FROM Users
      WHERE Users.id_user = Schedule.id_patient3
  ),
  patient_name4 = (
      SELECT last_name || ' ' || name
      FROM Users
      WHERE Users.id_user = Schedule.id_patient4
  ),
  patient_name5 = (
      SELECT last_name || ' ' || name
      FROM Users
      WHERE Users.id_user = Schedule.id_patient5
  );
`;
};

exports.upgradeStayQuery = () => {
  return `
      UPDATE Stay
      SET doctor_name = (
          SELECT last_name
          FROM Doctors
          WHERE Doctors.id_doctor = Stay.id_doctor
      ),
      doctor_specialty = (
          SELECT specialty
          FROM Doctors
          WHERE Doctors.id_doctor = Stay.id_doctor
      ),
      user_name = (
          SELECT last_name || ' ' || name
          FROM Users
          WHERE Users.id_user = Stay.id_user
      );
    `;
};
