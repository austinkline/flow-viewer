import "FungibleToken"
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
}
