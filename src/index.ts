import express from 'express';
import { testEndpoint, mintTicketEndpoint, getNFTEndpoint, verifyNFTEndpoint } from './controller';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
app.use(bodyParser.json());
const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};
const port = 3001;
app.use(cors(options));

// API endpoint for a simple test
app.get('/server', testEndpoint);
app.post('/mint-ticket', mintTicketEndpoint);
app.post('/verify-ticket', verifyNFTEndpoint);
app.get('/nft-details', getNFTEndpoint);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
