import {db} from "./dbConfig";

interface Person {
  id: number;
  firstname: string;
  lastname: string;
  phoneNumber: string;
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

// Function to execute a query to create person
export async function addPerson(person: Person): Promise<void> {
  try {
    const query = `
      INSERT INTO persons (first_name, last_name, phone_number)
      VALUES ($1, $2, $3)
    `;

    await (await db).none(query, [person.firstname, person.lastname, person.phoneNumber]);
    console.log('Person added successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error; // Optionally re-throw the error for handling in the calling code
  }
}

// Function to execute a query to update person
export async function updatePerson(personUpdate: Person): Promise<void> {
  try {
    const { id, firstname, lastname, phoneNumber } = personUpdate;
    
    // Build the SQL query based on the provided update fields
    const query = `
      UPDATE persons
      SET
        first_name = $2,
        last_name = $3,
        phone_number = $4
      WHERE id = $1
    `;

    const values = [id, firstname, lastname, phoneNumber];

    await (await db).none(query, values);
    console.log('Person updated successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Function to execute a query to delete person
export async function deletePerson(personId: number): Promise<void> {
  try {
    const query = `
      DELETE FROM persons
      WHERE id = $1
    `;

    await (await db).none(query, [personId]);
    console.log('Person deleted successfully');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}