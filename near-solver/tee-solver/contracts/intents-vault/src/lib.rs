use near_sdk::store::LookupMap;
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{
    assert_one_yocto, env, ext_contract, log, near, require, AccountId,
    Gas, NearToken, PanicOnDefault, Promise, PromiseOrValue, PublicKey,
};

const TRANSFER_GAS: Gas = Gas::from_tgas(5);
const FT_TRANSFER_GAS: Gas = Gas::from_tgas(10);

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Order {
    pub id: String,
    pub maker: AccountId,
    pub taker: Option<AccountId>,
    pub amount: U128,
    pub token: Option<AccountId>,
    pub status: OrderStatus,
    pub created_at: u64,
    pub executed_at: Option<u64>,
}

#[near(serializers = [json, borsh])]
#[derive(Clone, PartialEq)]
pub enum OrderStatus {
    Pending,
    Executed,
    Cancelled,
    Failed,
}

#[ext_contract(ext_ft)]
trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    
    fn ft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        amount: U128,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<U128>;
}

#[ext_contract(ext_intents)]
trait IntentsContract {
    fn add_public_key(&mut self, public_key: PublicKey);
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct Contract {
    /// NEAR balances for each account
    pub balances: LookupMap<AccountId, u128>,
    /// All orders
    pub orders: LookupMap<String, Order>,
    /// Total deposits (for stats)
    pub total_near_deposits: u128,
    /// Owner of the contract
    pub owner: AccountId,
}

#[near]
impl Contract {
    #[init]
    pub fn new(owner: Option<AccountId>) -> Self {
        Self {
            balances: LookupMap::new(b"b"),
            orders: LookupMap::new(b"o"),
            total_near_deposits: 0,
            owner: owner.unwrap_or_else(env::predecessor_account_id),
        }
    }

    // ========== Deposit Functions ==========
    
    #[payable]
    pub fn deposit(&mut self) {
        let account_id = env::predecessor_account_id();
        let amount = env::attached_deposit();
        
        require!(amount.as_yoctonear() > 0, "Deposit amount must be greater than 0");
        
        let amount_u128 = amount.as_yoctonear();
        let current_balance = self.balances.get(&account_id).copied().unwrap_or(0);
        self.balances.insert(account_id.clone(), current_balance + amount_u128);
        self.total_near_deposits += amount_u128;
        
        log!(
            "Deposited {} yoctoNEAR from {}. New balance: {}",
            amount_u128,
            account_id,
            current_balance + amount_u128
        );
    }

    // ========== Withdraw Functions ==========
    
    pub fn withdraw(&mut self, amount: U128) -> Promise {
        let account_id = env::predecessor_account_id();
        let amount_u128: u128 = amount.into();
        
        let current_balance = self.balances.get(&account_id).copied().unwrap_or(0);
        require!(
            current_balance >= amount_u128,
            "Insufficient balance for withdrawal"
        );
        
        // Update balance
        self.balances.insert(account_id.clone(), current_balance - amount_u128);
        self.total_near_deposits = self.total_near_deposits.saturating_sub(amount_u128);
        
        log!(
            "Withdrawing {} yoctoNEAR to {}. New balance: {}",
            amount_u128,
            account_id,
            current_balance - amount_u128
        );
        
        // Transfer NEAR to the user
        Promise::new(account_id).transfer(NearToken::from_yoctonear(amount_u128))
    }

    // ========== Order Execution ==========
    
    pub fn execute_order(&mut self, order_id: String, taker: AccountId, amount: U128) -> Promise {
        let order = self.orders.get(&order_id);
        require!(order.is_some(), "Order not found");
        
        let mut order = order.unwrap().clone();
        require!(order.status == OrderStatus::Pending, "Order is not pending");
        require!(order.amount == amount, "Amount mismatch");
        
        // Only owner or authorized solvers can execute orders
        require!(
            env::predecessor_account_id() == self.owner || self.is_authorized_solver(),
            "Not authorized to execute orders"
        );
        
        // Update order status
        order.status = OrderStatus::Executed;
        order.taker = Some(taker.clone());
        order.executed_at = Some(env::block_timestamp());
        self.orders.insert(order_id.clone(), order.clone());
        
        let amount_u128: u128 = amount.into();
        
        // Handle NEAR transfer (simplified - removed token support for now)
        let maker_balance = self.balances.get(&order.maker).copied().unwrap_or(0);
        require!(maker_balance >= amount_u128, "Insufficient maker balance");
        
        self.balances.insert(order.maker.clone(), maker_balance - amount_u128);
        
        log!("Executing order {} from {} to {} for amount {}", 
            order_id, order.maker, taker, amount_u128);
        
        Promise::new(taker).transfer(NearToken::from_yoctonear(amount_u128))
    }

    pub fn create_order(&mut self, order_id: String, amount: U128) -> Order {
        let account_id = env::predecessor_account_id();
        let amount_u128: u128 = amount.into();
        
        // Verify the account has sufficient balance
        let balance = self.balances.get(&account_id).copied().unwrap_or(0);
        require!(balance >= amount_u128, "Insufficient NEAR balance for order");
        
        let order = Order {
            id: order_id.clone(),
            maker: account_id.clone(),
            taker: None,
            amount,
            token: None, // Simplified - only NEAR orders for now
            status: OrderStatus::Pending,
            created_at: env::block_timestamp(),
            executed_at: None,
        };
        
        // Store order
        self.orders.insert(order_id.clone(), order.clone());
        
        log!("Created order {} for {} with amount {}", order_id, account_id, amount_u128);
        
        order
    }

    pub fn cancel_order(&mut self, order_id: String) {
        let account_id = env::predecessor_account_id();
        
        let order = self.orders.get(&order_id);
        require!(order.is_some(), "Order not found");
        
        let mut order = order.unwrap().clone();
        require!(order.maker == account_id, "Only order maker can cancel");
        require!(order.status == OrderStatus::Pending, "Can only cancel pending orders");
        
        order.status = OrderStatus::Cancelled;
        self.orders.insert(order_id.clone(), order);
        
        log!("Cancelled order {}", order_id);
    }

    // ========== View Functions ==========
    
    pub fn get_balance(&self, account_id: AccountId) -> U128 {
        U128(self.balances.get(&account_id).copied().unwrap_or(0))
    }
    
    pub fn get_balances(&self, account_id: AccountId) -> Vec<(Option<AccountId>, U128)> {
        let mut result = vec![];
        
        // Add NEAR balance
        let near_balance = self.balances.get(&account_id).copied().unwrap_or(0);
        result.push((None, U128(near_balance)));
        
        result
    }
    
    pub fn get_order(&self, order_id: String) -> Option<Order> {
        self.orders.get(&order_id).cloned()
    }
    
    pub fn get_total_deposits(&self) -> U128 {
        U128(self.total_near_deposits)
    }

    // ========== Admin Functions ==========
    
    #[payable]
    pub fn add_public_key(
        &mut self,
        intents_contract_id: AccountId,
        public_key: PublicKey,
    ) -> Promise {
        assert_one_yocto();
        self.require_owner();

        ext_intents::ext(intents_contract_id)
            .with_attached_deposit(NearToken::from_yoctonear(1))
            .add_public_key(public_key)
    }

    // ========== Internal Functions ==========
    
    fn require_owner(&self) {
        require!(
            env::predecessor_account_id() == self.owner,
            "Only owner can perform this action"
        );
    }
    
    fn is_authorized_solver(&self) -> bool {
        let predecessor = env::predecessor_account_id();
        predecessor == self.owner || predecessor.to_string().contains("solver")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::{testing_env, VMContext};

    fn get_context(predecessor_account_id: AccountId) -> VMContext {
        VMContextBuilder::new()
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id)
            .build()
    }

    #[test]
    fn test_deposit_and_withdraw() {
        let mut context = get_context(accounts(1));
        context.attached_deposit = NearToken::from_yoctonear(1000).as_yoctonear();
        testing_env!(context.clone());
        
        let mut contract = Contract::new(Some(accounts(0)));
        
        // Deposit
        contract.deposit();
        assert_eq!(contract.get_balance(accounts(1)), U128(1000));
        
        // Withdraw
        contract.withdraw(U128(500));
        assert_eq!(contract.get_balance(accounts(1)), U128(500));
    }

    #[test]
    fn test_create_and_execute_order() {
        let mut context = get_context(accounts(1));
        context.attached_deposit = NearToken::from_yoctonear(1000).as_yoctonear();
        testing_env!(context.clone());
        
        let mut contract = Contract::new(Some(accounts(0)));
        
        // Deposit first
        contract.deposit();
        
        // Create order
        let order = contract.create_order("order1".to_string(), U128(500));
        assert_eq!(order.status, OrderStatus::Pending);
        
        // Execute order (as owner)
        testing_env!(get_context(accounts(0)));
        contract.execute_order("order1".to_string(), accounts(2), U128(500));
        
        let updated_order = contract.get_order("order1".to_string()).unwrap();
        assert_eq!(updated_order.status, OrderStatus::Executed);
    }
}