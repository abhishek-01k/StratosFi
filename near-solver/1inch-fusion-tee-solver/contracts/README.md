# Smart Contract Integration

The 1inch Fusion+ solver leverages the existing NEAR TEE Solver Registry contracts from the `tee-solver` project with modifications.

## Contract Architecture

### 1. Solver Registry Contract (`tee-solver/contracts/solver-registry`)
The existing contract already provides:
- TEE attestation verification
- Solver registration with checksum/codehash
- Pool management for liquidity
- Worker authentication

### 2. Intents Vault Contract (`tee-solver/contracts/intents-vault`)
Manages liquidity and order execution:
- Token deposits and withdrawals
- Balance tracking per solver
- Order execution authorization

## Required Modifications

To support 1inch Fusion+ orders, I added these methods to the intents vault:

```rust
// In intents-vault/src/lib.rs

#[near_bindgen]
impl IntentsVault {
    /// Execute a 1inch Fusion+ order
    pub fn execute_fusion_order(&mut self, 
        order_hash: String,
        source_token: AccountId,
        target_token: AccountId,
        source_amount: U128,
        target_amount: U128,
        maker: AccountId,
        receiver: AccountId,
        deadline: u64,
        signature: String,
    ) -> Promise {
        // Verify caller is registered solver
        self.assert_solver();
        
        // Verify order hasn't expired
        assert!(env::block_timestamp() / 1_000_000 < deadline, "Order expired");
        
        // Lock source tokens
        self.lock_tokens(&source_token, source_amount.0);
        
        // Execute swap logic
        // ... implementation specific to chain
        
        // Transfer tokens to receiver
        self.transfer_tokens(&target_token, &receiver, target_amount.0)
    }
    
    /// Report cross-chain order for coordination
    pub fn report_cross_chain_order(&mut self,
        order_id: String,
        source_chain: u32,
        target_chain: u32,
        secret_hash: String,
        amount: U128,
        expiration: u64,
    ) {
        self.assert_solver();
        
        // Store order details for cross-chain coordination
        self.cross_chain_orders.insert(&order_id, &CrossChainOrder {
            source_chain,
            target_chain,
            secret_hash,
            amount: amount.0,
            expiration,
            status: OrderStatus::Pending,
        });
    }
}
```

## Deployment

1. The existing contracts can be used as-is for basic functionality
2. I Added the Fusion+ specific methods if cross-chain coordination is needed
3. Deployed using the same process as the original TEE solver

## Integration Points

The TypeScript solver integrates with these contracts through:
- `NearService.registerSolver()` - Register with attestation
- `NearService.executeOrder()` - Submit orders for execution
- `NearService.getBalances()` - Check available liquidity
- `NearService.withdraw()` - Manage liquidity

I utilised the existing architecture to support the 1inch Fusion+ solver model.