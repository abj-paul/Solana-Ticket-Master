import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    clusterApiUrl,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
  } from "@solana/web3.js";
  import {
    ExtensionType,
    TOKEN_2022_PROGRAM_ID,
    createInitializeMintInstruction,
    createInitializeNonTransferableMintInstruction,
    getMintLen,
    mintTo,
    createAccount,
    transfer,
    burn,
    closeAccount,
    createInitializeTransferFeeConfigInstruction,
  } from "@solana/spl-token";
 import wallet from "./wallet.json";
import { TokenMetadata } from "@solana/spl-token-metadata";
  
  // Connection to devnet cluster
  const QUICKNODE_RPC = 'https://solana-devnet.g.alchemy.com/v2/MinrZVld3RStLg4EBIFTfi9N7dLADMwU'; // 👈 Replace with your QuickNode Solana Devnet HTTP Endpoint
  const payer = Keypair.fromSecretKey(new Uint8Array(wallet));
  const mintAuthority = Keypair.generate();
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  //const decimals = 2;
  const metaData: TokenMetadata = {
    updateAuthority: mint,
    mint: mint,
    name: "OPOS",
    symbol: "OPOS",
    uri: "https://i.pinimg.com/736x/ca/23/5e/ca235e787ebc3c182d0a89c8629da934.jpg"
  };
  

  const transferFeeConfigAuthority = Keypair.generate();
  const withdrawWithheldAuthority = Keypair.generate();

  // Set the decimals, fee basis points, and maximum fee
    const decimals = 0;
    const feeBasisPoints = 100; // 1%
    const maxFee = BigInt(9 * Math.pow(10, decimals)); // 9 tokens


async function nnft(){
  const connection = new Connection(QUICKNODE_RPC, 'confirmed');  
  // Transaction signature returned from sent transaction
  let transactionSignature: string;

    // Size of Mint Account with extension
    const extensions = [ExtensionType.NonTransferable, ExtensionType.TransferFeeConfig]
    const mintLen = getMintLen(extensions);
    // Minimum lamports required for Mint Account
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    // Step 1 - Airdrop to Payer
    // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    // await connection.confirmTransaction({ signature: airdropSignature, ...(await connection.getLatestBlockhash()) });

// Instruction to invoke System Program to create new account
const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer.publicKey, // Account that will transfer lamports to created account
    newAccountPubkey: mint, // Address of the account to create
    space: mintLen, // Amount of bytes to allocate to the created account
    lamports, // Amount of lamports transferred to created account
    programId: TOKEN_2022_PROGRAM_ID, // Program assigned as owner of created account
  });
  
  // Instruction to initialize the NonTransferable Extension
  const initializeNonTransferableMintInstruction =
    createInitializeNonTransferableMintInstruction(
      mint, // Mint Account address
      TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );
  
  // Instruction to initialize Mint Account data
  const initializeMintInstruction = createInitializeMintInstruction(
    mint, // Mint Account Address
    decimals, // Decimals of Mint
    mintAuthority.publicKey, // Designated Mint Authority
    null, // Optional Freeze Authority
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );

  const feeConfigTransaction = createInitializeTransferFeeConfigInstruction(
    mint,
    transferFeeConfigAuthority.publicKey,
    withdrawWithheldAuthority.publicKey,
    feeBasisPoints,
    maxFee,
    TOKEN_2022_PROGRAM_ID
    );
  
  // Add instructions to new transaction
  const transaction = new Transaction().add(
    createAccountInstruction,
    initializeNonTransferableMintInstruction,
    feeConfigTransaction,
    initializeMintInstruction
  );
  
  // Send transaction
  transactionSignature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [payer, mintKeypair] // Signers
  );
  
  console.log(
    "\nCreate Mint Account:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  
  // Create Token Account for Playground wallet
  const sourceTokenAccount = await createAccount(
    connection,
    payer, // Payer to create Token Account
    mint, // Mint Account address
    payer.publicKey, // Token Account owner
    undefined, // Optional keypair, default to Associated Token Account
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  // Random keypair to use as owner of Token Account
  const randomKeypair = new Keypair();
  // Create Token Account for random keypair
  const destinationTokenAccount = await createAccount(
    connection,
    payer, // Payer to create Token Account
    mint, // Mint Account address
    randomKeypair.publicKey, // Token Account owner
    undefined, // Optional keypair, default to Associated Token Account
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  // Mint tokens to sourceTokenAccount
  transactionSignature = await mintTo(
    connection,
    payer, // Transaction fee payer
    mint, // Mint Account address
    sourceTokenAccount, // Mint to
    mintAuthority, // Mint Authority address
    100, // Amount
    undefined, // Additional signers
    undefined, // Confirmation options
    TOKEN_2022_PROGRAM_ID // Token Extension Program ID
  );
  
  console.log(
    "\nMint Tokens:",
    `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`
  );
  
  try {
    // Attempt to Transfer tokens
    await transfer(
      connection,
      payer, // Transaction fee payer
      sourceTokenAccount, // Transfer from
      destinationTokenAccount, // Transfer to
      payer.publicKey, // Source Token Account owner
      100, // Amount
      undefined, // Additional signers
      undefined, // Confirmation options
      TOKEN_2022_PROGRAM_ID // Token Extension Program ID
    );
  } catch (error) {
    console.log("\nExpect Error:", error);
  }
  
  // Burn tokens
  transactionSignature = await burn(
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

nnft()
.then(()=>{})