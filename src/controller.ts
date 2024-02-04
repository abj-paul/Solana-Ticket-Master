import { mintTicket, getNFTs } from './onchain';
import { Request, Response } from 'express';

export const testEndpoint = (req: Request, res: Response) => {
  (res as any).json({ message: 'Server is running, and the test is successful!' });
};

export const mintTicketEndpoint = async(req: Request, res: Response) => {

  const { userAddress } = req.body;

  const nftURL = await mintTicket(userAddress as string);
  (res as any).json({ success: true, url: nftURL});
};

export const getNFTEndpoint = async(req: Request, res: Response) => {

  const { userAddress } = req.body;

  const nfts = await getNFTs(userAddress as string);
  (res as any).json({ success: true, nfts});
};