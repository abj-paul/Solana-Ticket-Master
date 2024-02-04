// Import necessary functions and constants from the Solana web3.js and SPL Token packages
import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    PublicKey,
} from '@solana/web3.js';
import {
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    mintTo,
    createAssociatedTokenAccountIdempotent,
    AuthorityType,
    createInitializeMetadataPointerInstruction,
    TYPE_SIZE,
    LENGTH_SIZE,
    getMintLen,
    ExtensionType,
    getMint,
    getMetadataPointerState,
    getTokenMetadata,
    createSetAuthorityInstruction,
    createInitializeNonTransferableMintInstruction,
    createInitializeTransferFeeConfigInstruction,
    createEnableCpiGuardInstruction,
    burn,
    closeAccount,
} from '@solana/spl-token';
import {
    createInitializeInstruction,
    createUpdateFieldInstruction,
    createRemoveKeyInstruction,
    pack,
    TokenMetadata,
} from '@solana/spl-token-metadata';

const QUICKNODE_RPC = 'https://api.testnet.solana.com'; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint
const connection = new Connection(QUICKNODE_RPC, 'confirmed');
import wallet from "../wallet.json";

const payer = Keypair.fromSecretKey(new Uint8Array(wallet));
const authority = Keypair.fromSecretKey(new Uint8Array(wallet));


const transferFeeConfigAuthority = Keypair.generate();
const withdrawWithheldAuthority = Keypair.fromSecretKey(new Uint8Array(wallet));

// Set the decimals, fee basis points, and maximum fee
  const decimals = 0;
  const feeBasisPoints = 100; // 1%
  const maxFee = BigInt(9 * Math.pow(10, decimals)); // 9 tokens



//const decimals = 0;
const mintAmount = 1;

function generateExplorerUrl(identifier: string, isAddress: boolean = false): string {
    if (!identifier) return '';
    const baseUrl = 'https://explorer.solana.com/';
    const localSuffix = '?cluster=testnet';
    const slug = isAddress ? 'address' : 'tx';
    return `${baseUrl}/${slug}/${identifier}${localSuffix}`;
}



async function mintTicketNFT(ticketOwner: string): Promise<[string, PublicKey]> {
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log({mint});
    

    const tokenMetadata: TokenMetadata = {
        updateAuthority: authority.publicKey,
        mint: mint,
        name: 'Jam Pass',
        symbol: 'JPS',
        uri: "https://apricot-fashionable-grasshopper-460.mypinata.cloud/ipfs/QmcJYftaYSQDRDVhfhXSuGRKEBvQAAAkyRDYRgGBc7zjpb",
        additionalMetadata: [["Background", "Blue"]],
    };

    // Calculate the minimum balance for the mint account
    const extensions = [ExtensionType.MetadataPointer, ExtensionType.NonTransferable, ExtensionType.TransferFeeConfig]
    const mintLen = getMintLen(extensions);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(tokenMetadata).length;
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

    // Prepare transaction
    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mint,
            space: mintLen,
            lamports: mintLamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMetadataPointerInstruction(
            mint,
            authority.publicKey,
            mint,
            TOKEN_2022_PROGRAM_ID,
        ),
        // Instruction to initialize the NonTransferable Extension
  
        createInitializeNonTransferableMintInstruction(
            mint, // Mint Account address
            TOKEN_2022_PROGRAM_ID // Token Extension Program ID
        ),

        createInitializeTransferFeeConfigInstruction(
            mint,
            transferFeeConfigAuthority.publicKey,
            withdrawWithheldAuthority.publicKey,
            feeBasisPoints,
            maxFee,
            TOKEN_2022_PROGRAM_ID
            ),

        createInitializeMintInstruction(
            mint,
            decimals,
            authority.publicKey,
            null,
            TOKEN_2022_PROGRAM_ID,
        ),
        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: mint,
            updateAuthority: authority.publicKey,
            mint: mint,
            mintAuthority: authority.publicKey,
            name: tokenMetadata.name,
            symbol: tokenMetadata.symbol,
            uri: tokenMetadata.uri,
        }),
    );
    // Initialize NFT with metadata
    const initSig = await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair, authority]);
    // Create associated token account
    const sourceAccount = await createAssociatedTokenAccountIdempotent(connection, payer, mint, new PublicKey(ticketOwner), {}, TOKEN_2022_PROGRAM_ID);

    console.log({sourceAccount});
    
    // Mint NFT to associated token account
    const mintSig = await mintTo(connection, payer, mint, sourceAccount, authority, mintAmount, [], undefined, TOKEN_2022_PROGRAM_ID);
   
    return [mintSig, mint];

}


async function burnNFT(sourceTokenAccount: PublicKey, mint: PublicKey){
     // Burn tokens
  let transactionSignature = await burn(
    connection,
    payer, // Transaction fee payer
    sourceTokenAccount, // Burn from
    mint, // Mint Account address
    payer.publicKey, // Token Account owner
    100, // Amount
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nBurn Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  
  // Close Token Account
  transactionSignature = await closeAccount(
    connection,
    payer, // Transaction fee payer
    sourceTokenAccount, // Token Account to close
    payer.publicKey, // Account to receive lamports from closed account
    payer.publicKey, // Owner of Token Account
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nClose Token Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
}

export const mintTicket = async (ticketOwner: string) => {
    const [mintSig, mint] = await mintTicketNFT(ticketOwner);
    console.log(`   ${generateExplorerUrl(mintSig)}`);
    console.log(`New NFT:`);
    const mintURL = generateExplorerUrl(mint.toBase58(), true);
    console.log(`   ${mintURL}`);
    return mintURL
}

function decodeAssociatedTokenAddress(associatedTokenAddress) {
    const decoded = new PublicKey(associatedTokenAddress);
    const mintAddress = decoded.toBase58().slice(0, 44); // First 44 characters represent the mint address
    return mintAddress;
}

export async function getNFTs(address:string) {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(address),
        { programId: new PublicKey(TOKEN_2022_PROGRAM_ID) } // Token program ID
      );
      return tokenAccounts.value;   
}

