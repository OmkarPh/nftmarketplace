#![feature(once_cell)]
#![no_std]
#[macro_use]

extern crate alloc;

pub mod contract_utils;
// pub mod test_env;
pub mod data;
pub mod event;
pub mod entry_points;
mod cep47;


pub use cep47::{Error, CEP47};
use alloc::{collections::BTreeMap, string::String};
use casper_types::U256;
pub type TokenId = U256;
pub type Meta = BTreeMap<String, String>;