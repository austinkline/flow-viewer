import { config } from '@onflow/fcl';
import flowJSON from '../../flow.app.json'
import { AccountSummary, Balance } from '@/types/flow';

import * as fcl from '@onflow/fcl';
import { TransactionStatus } from '@onflow/typedefs';

export const configure = (network: string) => {
    console.log("configuring flow", { network })

    let acessNode = ""
    let discoveryWallet = ""

    switch (network) {
        case "testnet":
            acessNode = "https://access-testnet.onflow.org"
            discoveryWallet = "https://fcl-discovery.onflow.org/testnet/authn"
            break
        case "mainnet":
            acessNode = "https://access-mainnet.onflow.org"
            discoveryWallet = "https://fcl-discovery.onflow.org/authn"
            break
        case "emulator":
            acessNode = "http://localhost:8888"
            discoveryWallet = "http://localhost:8701/fcl/authn"
            break
    }

    config({
        "flow.network": network,
        "accessNode.api": acessNode,
        "discovery.wallet": discoveryWallet,
    }).load({ flowJSON })
}

export const getAccountSummary = async (address: string): Promise<AccountSummary | null> => {
    const result = await fcl.query({
        cadence: `import "FtUtils"

access(all) fun main(addr: Address): AnyStruct {
    let acct = getAuthAccount<auth(BorrowValue) &Account>(addr)
    return FtUtils.resolveAccountBalances(acct: acct)
}`,
        args: (arg: any, t: any) => [arg(address, t.Address)]
    })

    return result as AccountSummary
}

export const sendTokens = async (receiver: string, amount: number, balance: Balance): Promise<string> => {
    const txn = `import "FungibleToken"
import "FungibleTokenMetadataViews"

transaction(to: Address, amount: UFix64, tokenTypeIdentifier: String, storagePath: StoragePath) {
    let tokens: @{FungibleToken.Vault}

    prepare(acct: auth(BorrowValue) &Account) {
        let vault = acct.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: storagePath)
            ?? panic("vault not found at storage path: ".concat(storagePath.toString()))
        self.tokens <- vault.withdraw(amount: amount)
        assert(self.tokens.getType().identifier == tokenTypeIdentifier, message: "unexpected token type")
    }

    execute {
        let ftData = self.tokens.resolveView(Type<FungibleTokenMetadataViews.FTVaultData>())! as! FungibleTokenMetadataViews.FTVaultData
        let receiver = getAccount(to).capabilities.get<&{FungibleToken.Receiver}>(ftData.receiverPath).borrow()
            ?? panic("unable to borrow receiver capability at path: ".concat(ftData.receiverPath.toString()))
        receiver.deposit(from: <-self.tokens)
    }
}`

    const transactionId = await fcl.mutate({
        cadence: txn,
        args: (arg: any, t: any) => [
            arg(receiver, t.Address),
            arg(amount.toFixed(6), t.UFix64),
            arg(balance.vaultType, t.String),
            arg(balance.storagePath, t.Path)
        ]
    })

    return transactionId
}

export const waitForSeal = async (txnId: string): Promise<TransactionStatus> => {
    const result = await fcl.tx(txnId).onceSealed()
    return result
}