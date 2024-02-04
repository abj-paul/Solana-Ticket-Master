use anchor_lang::prelude::*;

declare_id!("F1w7fTd2nex3mYFA8sH85kU74dbFy88jKeCMDYDBg7eT");

#[program]
pub mod event_manager {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn create_event(ctx: Context<CreateEvent>, event: EventDetails) -> ProgramResult {
        let event_info = &mut ctx.accounts.event_info;
        event_info.name = event.name;
        event_info.description = event.description;
        event_info.image_url = event.image_url;
        event_info.location = event.location;
        event_info.time = event.time;
        event_info.number_of_tickets = event.number_of_tickets;
        Ok(())
    }

    pub fn buy_ticket(ctx: Context<BuyTicket>) -> Result<()> {
        let event_info = &mut ctx.accounts.event_info;
        if event_info.number_of_tickets > 0 {
            event_info.number_of_tickets -= 1;
            Ok(())
        } else {
            err!(ErrorCode::OutOfTickets)
        }
    }
}

#[derive(Accounts)]
pub struct CreateEvent<'info> {
    #[account(mut)]
    pub event_info: Account<'info, EventInfo>,
    pub user: AccountInfo<'info>,
    pub system_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct BuyTicket<'info> {
    #[account(mut)]
    pub event_info: Account<'info, EventInfo>,
}

#[derive(Accounts)]
pub struct GetEvent<'info> {
    pub event_info: Account<'info, EventInfo>,
}

#[account]
pub struct EventInfo {
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub location: String,
    pub time: i64,
    pub number_of_tickets: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The event is out of tickets.")]
    OutOfTickets,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct EventDetails {
    pub name: String,
    pub description: String,
    pub image_url: String,
    pub location: String,
    pub time: i64,
    pub number_of_tickets: u64,
}