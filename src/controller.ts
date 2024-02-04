import { mintTicket } from './onchain';
import { Request, Response } from 'express';

export const testEndpoint = (req: Request, res: Response) => {
  (res as any).json({ message: 'Server is running, and the test is successful!' });
};

export const mintTicketEndpoint = async(req: Request, res: Response) => {
  const userAddress = req.body.address;
  await mintTicket(userAddress as string);
  (res as any).json({ message: 'Server is running, and the test is successful!' });
};