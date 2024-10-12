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

export const sendTokens = async (receivers: string[], amounts: number[], balance: Balance): Promise<string> => {
    const txn = `import "FungibleToken"
import "FungibleTokenMetadataViews"

transaction(receivers: [Address], amounts: [UFix64], tokenTypeIdentifier: String, storagePath: StoragePath) {
    let tokenAmounts: @[{FungibleToken.Vault}]
    let ftData: FungibleTokenMetadataViews.FTVaultData

    prepare(acct: auth(BorrowValue) &Account) {
        pre {
            receivers.length > 0: "must have at least one receiver and amount"
            receivers.length == amounts.length: "length of receivers and amounts must match"
        }

        self.tokenAmounts <- []

        let vault = acct.storage.borrow<auth(FungibleToken.Withdraw) &{FungibleToken.Vault}>(from: storagePath)
            ?? panic("vault not found at storage path: ".concat(storagePath.toString()))

        for idx, amount in amounts {
            let tokens <- vault.withdraw(amount: amount)
            assert(tokens.getType().identifier == tokenTypeIdentifier, message: "unexpected token type")
            self.tokenAmounts.append(<-tokens)
        }

        let ref: &{FungibleToken.Vault} = &self.tokenAmounts[0]
        self.ftData = ref.resolveView(Type<FungibleTokenMetadataViews.FTVaultData>())! as! FungibleTokenMetadataViews.FTVaultData
    }

    execute {
        var count = 0
        while self.tokenAmounts.length > 0 {
            let receiver = getAccount(receivers[count]).capabilities.get<&{FungibleToken.Receiver}>(self.ftData.receiverPath).borrow()
                ?? panic("unable to borrow receiver capability at path: ".concat(self.ftData.receiverPath.toString()))
            receiver.deposit(from: <-self.tokenAmounts.removeFirst())
            count = count + 1
        }

        assert(self.tokenAmounts.length == 0, message: "tokens still left to send")
        destroy <-self.tokenAmounts
    }
}`

    const transactionId = await fcl.mutate({
        cadence: txn,
        args: (arg: any, t: any) => [
            arg(receivers, t.Array(t.Address)),
            arg(amounts.map(amount => amount.toFixed(8)), t.Array(t.UFix64)),
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
