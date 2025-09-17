module 0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise {

    use std::signer;
    use std::table;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;

    const E_ALREADY_SPENT: u64 = 0;
    const E_NOT_ADMIN: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_VAULT_NOT_INITIALIZED: u64 = 3;

    const WITHDRAW_AMOUNT: u64 = 10000000; // 1 APT in Octas
    const ADMIN_ADDRESS: address = @0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753;


    /// Mixer Vault storing balance, Merkle root, and nullifier set
    struct Vault has key {
        balance: coin::Coin<AptosCoin>,
        root: vector<u8>, // Latest Merkle root commitment
        used_nullifiers: table::Table<vector<u8>, bool>, // Prevent double-withdraw
    }

    public entry fun init(admin: &signer) {
        let sender = signer::address_of(admin);
        assert!(sender == ADMIN_ADDRESS, E_NOT_ADMIN);
        assert!(!exists<Vault>(ADMIN_ADDRESS), E_ALREADY_INITIALIZED);

        let tbl = table::new<vector<u8>, bool>();
        move_to(admin, Vault {
            balance: coin::zero<AptosCoin>(),
            root: b"",
            used_nullifiers: tbl,
        });
    }

    //MUST BE DEPOSITED VIA WEBSITE OR FUNDS WILL BE LOST

    public entry fun deposit(user: &signer, amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(ADMIN_ADDRESS);
        let coins = coin::withdraw<AptosCoin>(user, amount);
        coin::merge(&mut vault.balance, coins);
        
    }

    public entry fun update_root(admin: &signer, new_root: vector<u8>) acquires Vault {
        let sender = signer::address_of(admin);
        assert!(sender == ADMIN_ADDRESS, E_NOT_ADMIN);
        assert!(exists<Vault>(ADMIN_ADDRESS), E_VAULT_NOT_INITIALIZED);
        let vault = borrow_global_mut<Vault>(ADMIN_ADDRESS);
        vault.root = new_root;
    }


   
    public entry fun withdraw(
        admin: &signer,             
        recipient: address,         
        nullifier: vector<u8>,
    ) acquires Vault {
        let sender = signer::address_of(admin);
        assert!(sender == ADMIN_ADDRESS, E_NOT_ADMIN);

        let vault = borrow_global_mut<Vault>(ADMIN_ADDRESS);

        // Prevent double-spending using nullifier
        if (table::contains(&vault.used_nullifiers, nullifier)) {
            abort E_ALREADY_SPENT;
        };

        // Dispense fixed amount (1 APT)
        let payout = coin::extract<AptosCoin>(&mut vault.balance, WITHDRAW_AMOUNT);
        coin::deposit<AptosCoin>(recipient, payout);

        // Mark nullifier as spent
        table::add(&mut vault.used_nullifiers, nullifier, true);
    }

    #[view]
    public fun get_root(admin_addr: address): vector<u8> acquires Vault {
        let vault = borrow_global<Vault>(admin_addr);
        vault.root
    }


    #[view]
    public fun is_spent(admin_addr: address, nullifier: vector<u8>): bool acquires Vault {
        let vault = borrow_global<Vault>(admin_addr);
        table::contains(&vault.used_nullifiers, nullifier)
    }


    #[view]
    public fun get_balance(admin_addr: address): u64 acquires Vault {
        let vault = borrow_global<Vault>(admin_addr);
        coin::value<AptosCoin>(&vault.balance)
    }

}
