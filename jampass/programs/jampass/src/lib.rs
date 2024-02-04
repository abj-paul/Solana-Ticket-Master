use anchor_lang::prelude::*;

declare_id!("F1w7fTd2nex3mYFA8sH85kU74dbFy88jKeCMDYDBg7eT");

#[program]
pub mod jampass {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
