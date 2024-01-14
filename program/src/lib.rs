use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use std::convert::TryInto;
pub mod state;
use borsh::BorshSerialize;
use state::EventState;

pub mod detail;
use detail::TicketInstruction;

pub fn register_tickets(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    event_name: String,
    description: String,
    number_of_tickets: u32,
) -> ProgramResult {
    msg!("Registering Tickets for {}", event_name);

    // Get Account iterator
    let account_info_iter = &mut accounts.iter();

    // Get accounts
    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Derive PDA and check that it matches client
    let (pda, bump_seed) = Pubkey::find_program_address(
        &[initializer.key.as_ref(), event_name.as_bytes().as_ref()],
        program_id,
    );

    // Calculate account size required
    let account_len: usize = 1 + 4 + (4 + event_name.len()) + (4 + description.len());

    // Calculate rent required
    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    // Create the account
    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[
            initializer.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[&[
            initializer.key.as_ref(),
            event_name.as_bytes().as_ref(),
            &[bump_seed],
        ]],
    )?;

    msg!("PDA created: {}", pda);

    msg!("unpacking state account");
    let mut account_data =
        try_from_slice_unchecked::<EventState>(&pda_account.data.borrow()).unwrap();
    msg!("borrowed account data");

    account_data.title = event_name;
    account_data.number_of_tickets = number_of_tickets;
    account_data.description = String::from("Default description.");
    account_data.is_initialized = true;

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = TicketInstruction::unpack(instruction_data)?;
    match instruction {
        TicketInstruction::RegisterTickets {
            event_name,
            description,
            number_of_ticket,
        } => register_tickets(
            program_id,
            accounts,
            event_name,
            description,
            number_of_ticket,
        ),
    }
}

entrypoint!(process_instruction);
