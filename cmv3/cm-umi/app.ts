import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchCandyMachine,
  fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";

const QUICKNODE_RPC = 'https://solana-devnet.g.alchemy.com/v2/MinrZVld3RStLg4EBIFTfi9N7dLADMwU'; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint


import { percentAmount, generateSigner, some } from "@metaplex-foundation/umi";
import { TokenStandard } from "@metaplex-foundation/mpl-token-metadata";

const creatorA = generateSigner(umi).publicKey;
const creatorB = generateSigner(umi).publicKey;
const candyMachineSettings = {
  tokenStandard: TokenStandard.NonFungible,
  sellerFeeBasisPoints: percentAmount(33.3, 2),
  symbol: "MYPROJECT",
  maxEditionSupply: 0,
  isMutable: true,
  creators: [
    { address: creatorA, percentageShare: 50, verified: false },
    { address: creatorB, percentageShare: 50, verified: false },
  ],
};

async function connectToCandyMachine(pubKey){
    const umi = createUmi(QUICKNODE_RPC).use(mplCandyMachine());
    const candyMachinePublicKey = publicKey(pubKey);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
    console.log(`✅ - Connected to Candy Machine ${pubKey}`);
}
connectToCandyMachine("G4suGCZ3PokhsdL15Jyru22aeFBExKxmJLvaPsTRFEoh")
.then((data)=>{})
.catch((err)=>{console.error(err);})