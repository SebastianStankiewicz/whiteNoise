# app.py
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from MerkleTree import *
import requests
from datetime import datetime, timezone, timedelta
from aptos_sdk.account import Account
from aptos_sdk.async_client import RestClient
from aptos_sdk.bcs import Serializer
from aptos_sdk.account_address import AccountAddress
from aptos_sdk.transactions import EntryFunction, TransactionPayload, TransactionArgument
import asyncio
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'LOOKING-FOR-A-PLACEMENT-YEAR'

tree = IncrementalMerkleTree()

load_dotenv()

VALUT_PRIVATE_KEY = os.getenv("VALUT_PRIVATE_KEY")
VALUT_WALLET_ADDRESS =  os.getenv("VALUT_WALLET_ADDRESS")
NODIT_API_BASE = "https://aptos-testnet.nodit.io/"
MAX_TX_AGE = 5
NODE_URL = "https://api.testnet.aptoslabs.com/v1/"


rest_client = RestClient(NODE_URL)

#TODO: Replace this with redis.
depositHistory = set()


def validateDeposit(depositTX):
    if depositTX in depositHistory:
        return {"valid": False, "reason": "TX Already deposited."}
    depositHistory.add(depositTX)
    
    url = f"{NODIT_API_BASE}v1/transactions/by_hash/{depositTX}"  
    try:
        API_KEY = os.getenv("NODIT_API_KEY") 

        headers = {
            "accept": "application/json",
            "X-API-KEY": API_KEY
        }

        res = requests.get(url, headers=headers)

        res.raise_for_status()
        tx = res.json()

        if tx.get("success") is not True:
            return {"valid": False, "reason": "Transaction not successful"}


        func = tx.get("payload", {}).get("function", "")
        if func not in ["0x1::coin::transfer", "0x1::aptos_account::transfer", "0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise::deposit"]:
            return {"valid": False, "reason": "Not a valid transfer function"}



        arguments = tx.get("payload", {}).get("arguments", [])
        amount = int(arguments[0])
        
        if amount != 10000000:
            return {"valid": False, "reason": "NOT 0.1 APTOS"}

        epoch = int(tx.get("timestamp", 0))  
        tx_time = datetime.fromtimestamp(epoch / 1e6, tz=timezone.utc)
        now = datetime.now(timezone.utc)

        if now - tx_time > timedelta(minutes=MAX_TX_AGE):
            return {"valid": False, "reason": "Transaction too old"}

        return {"valid": True, "reason": "All Checks passed"}
        
    except Exception as e:
        return {"valid": False, "reason": e}
    
    
async def updateMerkleTreeRootOnChain(newRoot):
    try:
        account = Account.load_key(VALUT_PRIVATE_KEY)
        rootBytes = bytes.fromhex(newRoot)

        # Build transaction payload
        entry_function = EntryFunction.natural(
            "0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise",
            "update_root",
            [],
            [
                TransactionArgument(rootBytes, Serializer.to_bytes),
            ]
        )

        account_data = await rest_client.account(account.address())
        sequence_number = int(account_data["sequence_number"])
        
        signed_transaction = await rest_client.create_bcs_signed_transaction(
            account,                                  
            TransactionPayload(entry_function),     
            sequence_number=sequence_number         
        )
        tx_hash = await rest_client.submit_bcs_transaction(signed_transaction)
        
        await rest_client.wait_for_transaction(tx_hash)

        transaction_details = await rest_client.transaction_by_hash(tx_hash)
        print(transaction_details)
        return {"success": True, "TX": transaction_details}

    except Exception as e:
        print(f"❌ Failed to update Merkle root: {e}")
        return None


async def withdrawAptosFromVault(withdrawWalletAddress, hashedSecretInBytes):
    RECEIVER_ADDRESS = withdrawWalletAddress
    try:
        account = Account.load_key(VALUT_PRIVATE_KEY)
        balance = await rest_client.account_balance(account.address())
        if balance < 110000000:
            return False
        nullifier_bytes = hashedSecretInBytes
        hashedSecretInBytes
        entry_function = EntryFunction.natural(
            "0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise",  # Module address and name
            "withdraw",            # Function name
            [],                    # Type arguments (empty for this function)
            [
                TransactionArgument(AccountAddress.from_str(RECEIVER_ADDRESS), Serializer.struct),  # Recipient address
                TransactionArgument(nullifier_bytes, Serializer.to_bytes)         
            ],
        )
        account_data = await rest_client.account(account.address())
        sequence_number = int(account_data["sequence_number"])
        
        signed_transaction = await rest_client.create_bcs_signed_transaction(
            account,                                  
            TransactionPayload(entry_function),     
            sequence_number=sequence_number         
        )
        tx_hash = await rest_client.submit_bcs_transaction(signed_transaction)
        
        await rest_client.wait_for_transaction(tx_hash)

        transaction_details = await rest_client.transaction_by_hash(tx_hash)
        return {"success": True, "TX": transaction_details}
            
    except Exception as e:
        print(e)
        return {"success": False}
    
async def fetchVaultInfo():
    try:
        account = Account.load_key(VALUT_PRIVATE_KEY)
        
        # Your module function id
        function_id = "0x9c19f31c0e121a67ef47a340c3d47d0f930df610b2ad9252c8b6885a9d67c753::whiteNoise::get_balance"
        
        # Admin address argument (pass the admin address owning the Vault)
        admin_addr = account.address()
        
        # Prepare arguments for view_function call
        args = [
            TransactionArgument(admin_addr, Serializer.struct),
        ]
        
        # Call the view function (no signing or transaction)
        balance_str = await rest_client.view_function(
            function_id=function_id,
            type_arguments=[],
            arguments=args,
        )
        
        balance = int(balance_str)
        print(f"Vault balance: {balance} octas")
        return {"success": True, "balance": balance}
    
    except Exception as e:
        print("Failed to grab balance from vault:", e)
        return {"success": False, "error": str(e)}

  
        
@app.route('/vaultInfo', methods=['GET'])
def vaultInfo():
    
    #Get the vault balance. 
    info = asyncio.run(fetchVaultInfo())
    print(info)
    
    return jsonify({
        "status": "Success",
        "APT": 0,
        "USDC": 0,
        "APR": 0
    })

@app.route('/deposit', methods=['POST'])
def deposit():
    data = request.get_json()
    secret = data.get('secret')
    txHASH = data.get('txHASH')
    isTxValid = validateDeposit(txHASH)
    print(isTxValid)
    if not isTxValid["valid"]:
        return jsonify({"status": "Error", "message": "Invalid TX"}), 400
    if not secret:
        return jsonify({"status": "Error", "message": "Missing secret"}), 400
    
    tree.insert(secret)
    root = tree.get_root()
    proof = tree.get_proof(secret)  
    
    asyncio.run(updateMerkleTreeRootOnChain(root))
    
    return jsonify({
        "status": "Success",
        "root": root,
        "proof": proof
    })


@app.route('/withdraw', methods=['POST'])
def verifyWithdraw():
    data = request.get_json() 
    secret = data["withdrawData"].get('secret')
    secretBytes = secret.encode('utf-8')
    hashedSecretInBytes = hashlib.sha256(secretBytes).digest()
    proof = data["withdrawData"].get('proof')
    root = data["withdrawData"].get('root')
    
    withdrawWalletAddress = data.get('withdrawAddress')
    

    descision = tree.verify_proof(secret, proof, root)
    if descision:
        tx = asyncio.run(withdrawAptosFromVault(withdrawWalletAddress, hashedSecretInBytes))
        return {"success": descision, "tx": tx}
    return {"status": descision}


if __name__ == '__main__':
    app.run(debug=True)
