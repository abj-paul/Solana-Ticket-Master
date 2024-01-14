use borsh::BorshDeserialize;
use borsh::BorshSerialize;
use solana_program::program_error::ProgramError;
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct TicketRegisterPayload {
    pub name_of_event: String,
    pub event_description: String,
    pub number_of_ticket: u32,
}

pub enum TicketInstruction {
    RegisterTickets {
        event_name: String,
        description: String,
        number_of_ticket: u32,
    },
    /*BuyTickets {
        ticketId: u32,
    },
    ViewTicketInformation {
        ticketId: u32,
    },*/
}

impl TicketInstruction {
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        let payload = TicketRegisterPayload::try_from_slice(rest).unwrap();
        Ok(match variant {
            0 => Self::RegisterTickets {
                event_name: payload.name_of_event,
                description: payload.event_description,
                number_of_ticket: payload.number_of_ticket,
            },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}
