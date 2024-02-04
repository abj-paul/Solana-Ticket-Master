import express, { Request, Response } from 'express';
import { testEndpoint, mintTicketEndpoint } from './controller';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
const port = 3001;

// API endpoint for a simple test
app.get('/server', testEndpoint);
app.post('/mint-ticket', mintTicketEndpoint);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
