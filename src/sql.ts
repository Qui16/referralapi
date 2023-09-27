import {db} from "./dbConfig";

//interface for Referral
interface Referral {
  referralID: Number,
  referrer: {
    practiceName: String,
    doctorName: String,
    phoneNumber: String,
    emailAddress: String
  },
  initialAssessment: String,
  notes: String,
  specialistName: String,
  patient: {
    name: String,
    medicareNumber: String,
    dateOfBirth: Date
  }
}

//interface for Patient
interface Patient {
  name: String,
  medicareNumber: String,
  dateOfBirth: Date
}

//interface for Referrer
interface Referrer {
  practiceName: String,
  doctorName: String,
  phoneNumber: String,
  emailAddress: String
}

//interface for Referrer
interface Referral {

}

// Function to execute a query to get all people
export async function getAllReferrals() {
  try {
    const sqlQuery= 
    `
    SELECT
      Referral.referralID,
      Referrer.practiceName,
      Referrer.doctorName,
      Referrer.phoneNumber,
      Referrer.emailAddress,
      Referral.initialAssessment,
      Referral.notes,
      Referral.specialistName,
      Patient.name,
      Patient.medicareNumber,
      Patient.dateOfBirth
    FROM Referral
    INNER JOIN Referrer ON Referral.referrerID = Referrer.referrerID
    INNER JOIN Patient ON Referral.patientID = Patient.patientID;
    `;
    const response = await (await db).query(sqlQuery);
    return response;
  } catch (error) {
    console.error('Error:', error);
  } /*finally {
    db.$pool.end(); // Close the database connection when done
  }*/
}

// Function to execute a query to get Patient by ID
export async function getPatientByID(id: Number) {
  try {
    const query = 
    `
    SELECT name, medicareNumber, dateOfBirth
    FROM PATIENT WHERE patientID=$1
    `;
    const response = await (await db).query(query, [id]);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get Referrer by ID
export async function getReferrerByID(id: Number) {
  try {
    const query = 
    `
    SELECT practiceName, doctorName, phoneNumber, emailAddress
    FROM REFERRER WHERE referrerID=$1
    `;
    const response = await (await db).query(query, [id]);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get Referral by ID
export async function getReferralByID (id: Number){
  try {
    const query = `SELECT * FROM REFERRAL WHERE ID=$1`;
    const response = await (await db).query(query, [id]);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get all Referral
export async function getAllReferral() {
  try {
    const query = `SELECT * FROM REFERRAL`;
    const response = await (await db).query(`SELECT * FROM referral`);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get all Patient
export async function getAllPatient() {
  try {
    const query = `SELECT * FROM PATIENT`;
    const response = await (await db).query(query);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get all Referrer
export async function getAllReferrer() {
  try {
    const query = `SELECT * FROM REFERRER`;
    const response = await (await db).query(query);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}
// Function to execute a query to get ID of referrer
export async function getReferrerID(referrer: Referrer) {
  try {
    const query = `SELECT 'referrerid' FROM REFERRER
    WHERE 
    practicename = $1 AND
    doctorname = $2 AND
    phonenumber = $3 AND
    emailaddress = $4
    `;
    const response = await (await db).query(query,[referrer.practiceName, referrer.doctorName, referrer.phoneNumber, referrer.emailAddress]);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to get all Referrer
export async function getPatientID(patient: Patient) {
  try {
    const query = `SELECT 'patientid' FROM PATIENT
    WHERE 
    name = $1 AND
    medicarenumber = $2 AND
    dateofbirth = $3
    `;
    const response = await (await db).query(query,[patient.name, patient.medicareNumber, patient.dateOfBirth]);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}

// Function to execute a query to create referral
export async function createReferral(referral: Referral, referrerID:Number, patientID:Number): Promise<void> {
  try {
    const query = `
      INSERT INTO REFERRAL (referrerid,initialassessment, notes, specialistname, patientid)
      VALUES ($1, $2, $3, $4, $5)
    `;

    await (await db).none(query, [referrerID, referral.initialAssessment, referral.notes, referral.specialistName, patientID]);
    console.log('Referral added successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error; // Optionally re-throw the error for handling in the calling code
  }
}

// Function to execute a query to create referrer
export async function createReferrer(referrer: Referrer): Promise<void> {
  try {
    const query = `
      INSERT INTO REFERRER (practicename,doctorname, phonenumber, emailaddress)
      VALUES ($1, $2, $3, $4)
    `;

    await (await db).none(query, [referrer.practiceName, referrer.doctorName, referrer.phoneNumber, referrer.emailAddress]);
    console.log('Referrer created successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error; // Optionally re-throw the error for handling in the calling code
  }
}

// Function to execute a query to create patient
export async function createPatient(patient: Patient): Promise<void> {
  try {
    const query = `
      INSERT INTO PATIENT (name,medicarenumber, dateofbirth)
      VALUES ($1, $2, $3)
    `;

    await (await db).none(query, [patient.name, patient.medicareNumber, patient.dateOfBirth]);
    console.log('Patient created successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error; // Optionally re-throw the error for handling in the calling code
  }
}

// Function to execute a query to get most current ID
export async function getCurrentID() {
  try {
    const query = `SELECT MAX(referralid) FROM REFERRAL;`;
    const response = await (await db).query(query);
    return response;
  } catch (error) {
    console.error('Error:', error);
  }
}
