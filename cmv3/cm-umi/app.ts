import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplCandyMachine } from "@metaplex-foundation/mpl-candy-machine";
import { publicKey } from "@metaplex-foundation/umi";
import {
  fetchCandyMachine,
  fetchCandyGuard,
} from "@metaplex-foundation/mpl-candy-machine";

const QUICKNODE_RPC = 'https://solana-devnet.g.alchemy.com/v2/MinrZVld3RStLg4EBIFTfi9N7dLADMwU'; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint


async function connectToCandyMachine(pubKey){
    const umi = createUmi(QUICKNODE_RPC).use(mplCandyMachine());
    const candyMachinePublicKey = publicKey(pubKey);
    const candyMachine = await fetchCandyMachine(umi, candyMachinePublicKey);
    const candyGuard = await fetchCandyGuard(umi, candyMachine.mintAuthority);
    console.log(`✅ - Connected to Candy Machine ${pubKey}`);

    console.log(candyGuard.guards); // All guard settings.
}
connectToCandyMachine("G4suGCZ3PokhsdL15Jyru22aeFBExKxmJLvaPsTRFEoh")
.then((data)=>{})
.catch((err)=>{console.error(err);})