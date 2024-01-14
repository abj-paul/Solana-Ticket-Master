use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize)]
pub struct EventState {
    pub is_initialized: bool,
    pub number_of_tickets: u32,
    pub description: String,
    pub title: String,
}
