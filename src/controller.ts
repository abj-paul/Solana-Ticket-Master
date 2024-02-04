import { Request, Response } from 'express';

export const testEndpoint = (req: Request, res: Response) => {
  (res as any).json({ message: 'Server is running, and the test is successful!' });
};