import express from 'express';
import bodyParser from 'body-parser';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define models for Swagger
/**
 * @swagger
 * components:
 *   schemas:
 *     Patient:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - medicareNumber
 *         - dateOfBirth
 *       properties:
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         medicareNumber:
 *           type: string
 *           example: 1234567890
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           example: "1985-10-15"
 *     Referrer:
 *       type: object
 *       required:
 *         - practiceName
 *         - doctorName
 *         - phoneNumber
 *         - emailAddress
 *       properties:
 *         practiceName:
 *           type: string
 *           example: Green Valley Clinic
 *         doctorName:
 *           type: string
 *           example: Dr. Peter Parker
 *         phoneNumber:
 *           type: string
 *           example: "04XX XXX XXX"
 *         emailAddress:
 *           type: string
 *           example: peter.parker@gvc.com
 *     Referral:
 *       type: object
 *       required:
 *         - patient
 *         - patientAssessment
 *         - specialist
 *         - referrer
 *       properties:
 *         patient:
 *           $ref: '#/components/schemas/Patient'
 *         patientAssessment:
 *           type: string
 *           example: Patient shows symptoms of mild anxiety.
 *         notes:
 *           type: string
 *           example: Patient is also experiencing occasional insomnia.
 *         specialist:
 *           type: string
 *           example: Dr. Jane Smith, Psychiatrist
 *         referrer:
 *           $ref: '#/components/schemas/Referrer'
 */

// Swagger setup
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Referral API',
            version: '1.0.0',
        },
    },
    apis: ['./src/index.ts'], // Assuming you're in the root folder and your file is named 'index.ts'
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /api/referrals:
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
 *         description: Referral created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Referral'
 *       400:
 *         description: Bad request
 */

app.post('/api/referrals', (req, res) => {
    // ...Your existing code for this route
});

// ... Your other routes and code...

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
