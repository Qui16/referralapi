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
    patientid: Number,
    name: String,
    medicarenumber: String,
    dateofbirth: Date
  }
  
  //interface for Referrer
  interface Referrer {
    referrerid: Number,
    practicename: String,
    doctorname: String,
    phonenumber: String,
    emailaddress: String
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
        for (const obj of referral) {
            // The replacement object you want to insert
            const referrer = await sql.getReferrerByID(obj.referrerid);
            const patient = await sql.getPatientByID(obj.patientid);
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
                dateOfBirth: patient.length > 0 ? patient[0].dateofbirth : 'none' 
              }
            };
            referrals.push(modReferral);
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




app.get('/api/referrals', (req, res) => {
    loadReferralsData();
    res.status(200).json(referrals);
});


app.get('/api/referrals/:id', (req, res) => {
    loadReferralsData();
    const referral = referrals.find(r => r.referralID === +req.params.id);
    if (referral) {
        res.status(200).json(referral);
    } else {
        res.status(404).json({ message: 'Referral not found' });
    }
});

//find if referrer exist
function findReferrer(referral: Referral){
  //console.log(referrers[0]);
  //console.log('real:', referrers[0].practicename);
  const referrer = referrers.find(r=> 
    (r.practicename === referral.referrer.practiceName) ||
    (r.doctorname === referral.referrer.doctorName) ||
    (r.phonenumber === referral.referrer.phoneNumber) ||
    (r.emailaddress === referral.referrer.emailAddress)
    );
    console.log('practiceName:', referrers[0].practicename);
    console.log('doctorName:', referrers[0].doctorname);
    console.log('phoneNumber:', referrers[0].phonenumber);
    console.log('emailAddress:', referrers[0].emailaddress);
    if (!referrer) {
      throw new Error('Referrer not found');
    }
    //console.log('Found referrer:', referrer);
    return referrer;
}

//find if patient exist
function findPatient(referral: Referral){
  const patient = patients.find(r=>
    (r.name === referral.patient.name) ||
    (r.medicarenumber === referral.patient.medicareNumber) ||
    (r.dateofbirth === referral.patient.dateOfBirth)
    );
    console.log('name', patients[0].name);
    console.log('medicareNumber', patients[0].medicarenumber);
    console.log('DOB', patients[0].dateofbirth);
    return patient;
}

app.post('/api/referrals', async (req, res) => {
  try{
    await loadReferralsData();
  
    const referral: Referral = req.body;
    referral.referralID = currentId++;
    let patient = findPatient(referral);
    let referrer = findReferrer(referral);
    if (!referrer || !patient) {
      if(!referrer) {
        sql.createReferrer(referral.referrer.practiceName, referral.referrer.doctorName, referral.referrer.phoneNumber, referral.referrer.emailAddress);
        referrer = findReferrer(referral);
      }
      if(!patient) {
        sql.createPatient(referral.patient.name, referral.patient.medicareNumber, referral.patient.dateOfBirth);
        patient = findPatient(referral);
      }
      
    }
    console.log(referrer.referrerid);
    if(referrer && patient){
      sql.createReferral(referral, referrer.referrerid, patient.patientid) 
    }
    res.status(200).json(referral);
  }catch (error) {
    console.error('Error:', error);
  };
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
 *         referralid:
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
