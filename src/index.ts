import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

app.get('/test', (req: Request, res: Response) => {
  (res as any).json({ message: 'Server is running, and the test is successful!' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
