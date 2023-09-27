import express from 'express';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import * as sql from './sql';

const app = express();
app.use(bodyParser.json());
app.use(cors());

//interface for Patient
interface Patient {
    patientID: Number,
    name: String,
    medicareNumber: String,
    dateOfBirth: Date
  }
  
  //interface for Referrer
  interface Referrer {
    referrerID: Number,
    practiceName: String,
    doctorName: String,
    phoneNumber: String,
    emailAddress: String
  }

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

// Referrals storage
let referrals: any[] = [];
//let modReferrals: Referral;
let referrers: Referrer[] = [];
let patients: Patient[] = [];
let currentId = 1;

// Load data from PostgreSQL and populate the referrals array
async function loadReferralsData() {
    try {
      const referral = await sql.getAllReferral(); //Get all data in the same row
      const patient = await sql.getAllPatient();
      const referrer = await sql.getAllReferrer();
      currentId = await sql.getCurrentID(); 
      referrers = referrer;
      patients = patient;
      //referrals = referral; // Assign the fetched data to the referrals array              
      //let referralLength=referrals.length;
        //let referrer: Referrer = await sql.getReferrerByID(referral[i].referrerid)
        for (const obj of referral) {
            // The replacement object you want to insert
            const referrer = await sql.getReferrerByID(obj.referrerid);
            const patient = await sql.getPatientByID(obj.patientid);
            /*const referrers: Referrer={
              practiceName: referrer[0].practiceName,
              doctorName: referrer[0].doctorName,
              phoneNumber: referrer[0].phoneNumber,
              emailAddress: referrer[0].emailAddress
            };
            const patients: Patient={
              patientID: patient[0].patientid,
              name: patient[0].name,
              medicareNumber: patient[0].medicareNumber,
              dateOfBirth: patient[0].dateOfBirth
            };*/

            const modReferral: Referral = {
              referralID: obj.referralid,
              referrer: {
                practiceName: referrer.length > 0 ? referrer[0].practicename : 'none',
                doctorName: referrer.length > 0 ? referrer[0].doctorname : 'none',
                phoneNumber: referrer.length > 0 ? referrer[0].phonenumber : 'none',
                emailAddress: referrer.length > 0 ? referrer[0].emailaddress : 'none'
              },
              initialAssessment: obj.initialassessment,
              notes: obj.notes,
              specialistName: obj.specialistname,
              patient: {
                name: patient.length > 0 ? patient[0].name : 'none',
                medicareNumber: patient.length > 0 ? patient[0].medicarenumber : 'none',
                dateOfBirth: patient.length > 0 ? patient[0].dateofbirth : 'none', 
              }
            };
            referrals.push(modReferral);
            /*
            // The key you want to replace in each object
            const referrerID = 'referrerid';
            const patientID = 'patientid';
            if ((referrerID in obj) && (patientID in obj)) {
              obj[referrerID] = referrers;
              obj[patientID] = patient;
            }*/
          }
          
    } catch (error) {
      console.error('Error:', error);
    }
  }


// Swagger setup
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Referral API',
            version: '1.0.0',
        },
    },
    apis: ['./src/index.ts'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));



loadReferralsData();
app.get('/api/referrals', (req, res) => {
    res.status(200).json(referrals);
});


app.get('/api/referrals/:id', (req, res) => {
    const referral = referrals.find(r => r.referralID === +req.params.id);
    if (referral) {
        res.status(200).json(referral);
    } else {
        res.status(404).json({ message: 'Referral not found' });
    }
});

function findReferrer(){
  
}

app.post('/api/referrals', (req, res) => {
    const referral = req.body;
    referral.referralID = currentId++;
    const referrer = referrers.find(r => 
    (r.practiceName === referral.referrer.practiceName) &&
    (r.doctorName === referral.referrer.doctorName) &&
    (r.phoneNumber === referral.referrer.phoneNumber) &&
    (r.emailAddress === referral.referrer.emailAddress)
    );
    const patient = patients.find(r=>
    (r.name === referral.patient.name) &&
    (r.medicareNumber === referral.patient.medicareNumber) &&
    (r.dateOfBirth === referral.patient.dateOfBirth)
    );
    if (!referrer || !patient) {
      if(!referrer) {
        sql.createReferrer(referral.referrer);
        referrers.push(referral.referrer);
      }
      if(!patient) {
        sql.createPatient(referral.patient);
        patients.push(referral.patient)
      }
    }
    console.log(referral);
    sql.createReferral(referral, referrer.referrerID, patient.patientID)
    referrals.push(referral);
    res.status(200).json(referral);
});

export const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {

});

/**
 * @swagger
 * components:
 *   schemas:
 *     Referrer:
 *       type: object
 *       properties:
 *         practiceName:
 *           type: string
 *           description: The name of the practice or clinic.
 *           example: 'Green Clinic'
 *         doctorName:
 *           type: string
 *           description: The name of the referring doctor.
 *           example: 'Dr. John Doe'
 *         phoneNumber:
 *           type: string
 *           description: The phone number of the referrer (in Australian format).
 *           example: '+61 4XX XXX XXX'
 *         emailAddress:
 *           type: string
 *           description: The email address of the referrer.
 *           example: 'dr.johndoe@greenclinic.com.au'
 *     Patient:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the patient.
 *           example: 'Jane Smith'
 *         medicareNumber:
 *           type: string
 *           description: The medicare number of the patient.
 *           example: '2345 6789'
 *         dateOfBirth:
 *           type: string
 *           description: The date of birth of the patient.
 *           format: date
 *           example: '1990-01-01'
 *     Referral:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The referral ID.
 *         referrer:
 *           $ref: '#/components/schemas/Referrer'
 *         initialAssessment:
 *           type: string
 *           description: Initial assessment of the patient.
 *           example: 'Patient shows signs of chronic fatigue.'
 *         notes:
 *           type: string
 *           description: Additional notes related to the referral.
 *           example: 'Patient to be assessed by a cardiologist.'
 *         specialistName:
 *           type: string
 *           description: The name of the specialist for whom the referral is intended.
 *           example: 'Dr. Emily Stone'
 *         patient:
 *           $ref: '#/components/schemas/Patient'
 * /api/referrals:
 *   get:
 *     summary: Get all referrals
 *     responses:
 *       200:
 *         description: A list of referrals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Referral'
 *   post:
 *     summary: Create a new referral
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Referral'
 *     responses:
 *       201:
 *         description: Created new referral
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Invalid input
 * /api/referrals/{id}:
 *   get:
 *     summary: Get a referral by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the referral to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A referral data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       404:
 *         description: Referral not found
 */
