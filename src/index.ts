// ./index.ts

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const app = express();
app.use(bodyParser.json());
app.use(cors());

interface Referrer {
    practiceName: string;
    doctorName: string;
    phoneNumber: string; // Australian format e.g., 04XX XXX XXX
    emailAddress: string;
}

interface Patient {
    firstName: string;
    lastName: string;
    medicareNumber: string;
    dateOfBirth: string;  // ISO-8601: "YYYY-MM-DD"
}

interface Referral {
    id: number;
    patient: Patient;
    patientAssessment: string;
    notes: string;
    specialist: string;
    referrer: Referrer;
}

let referrals: Referral[] = [];
let currentId = 1;

// Swagger options
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Referral API',
            version: '1.0.0',
        },
    },
    apis: ['./src/index.ts'], // Path to this file
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Retrieve a list of referrals.
 *     responses:
 *       200:
 *         description: A list of referrals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Referral'
 */
app.get('/api/referrals', (req, res) => {
    res.json(referrals);
});

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     summary: Create a new referral.
 *     requestBody:
 *       description: Referral data to create.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Referral'
 *     responses:
 *       201:
 *         description: Created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Bad request.
 */
app.post('/api/referrals', (req, res) => {
    const {
        patient, patientAssessment, notes, specialist, referrer
    } = req.body;

    // Validation (you can enhance this further as required)
    if (!patient || !patientAssessment || !notes || !specialist || !referrer) {
        res.status(400).json({ error: 'All fields are required' });
        return;
    }

    const newReferral: Referral = {
        id: currentId++,
        patient,
        patientAssessment,
        notes,
        specialist,
        referrer
    };

    referrals.push(newReferral);
    res.status(201).json(newReferral);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
