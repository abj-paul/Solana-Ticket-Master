import express, { Request, Response } from 'express';
import { testEndpoint, mintTicketEndpoint } from './controller';

const app = express();
const port = 3001;

// API endpoint for a simple test
app.get('/server', testEndpoint);
app.get('/mint', mintTicketEndpoint);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
