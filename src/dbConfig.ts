import pgPromise from 'pg-promise';
import * as readline from 'readline';
import {PORT} from './index'
//create interface to read input data
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let dbConfig = {
  user: 'qdam',
  password: 's',
  host: 'my-postgres-instance.cgjx2jwkyxex.us-east-1.rds.amazonaws.com',
  port: 5432, // PostgreSQL default port
  database: 'awsbootcamp',
  ssl: {
    rejectUnauthorized: false // Temporary setting to accept self-signed certificates
  }
};

//ask user for password
function askForPassword(): Promise<string> {
  return new Promise((resolve) => {
    rl.question('Please enter the database password: ', (password) => {
      resolve(password);
    });
  });
}

// Create a PostgreSQL database instance
const pgp = pgPromise({});

// AWS RDS database connection configuration
export async function DBConnect() {
  const password = await askForPassword();
  dbConfig.password=password;
  const db = pgp(dbConfig);

// Function to test the connection
async function testConnection() {
  try {
    await db.connect(); // Attempt to connect
    console.log('Connection to the database successful!');
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Error:', error);
  } /*finally {
    await db.$pool.end(); // Close the connection pool
    rl.close();
  }*/
}

//test DB connection
await testConnection();
return db;
}

export const db=DBConnect();





