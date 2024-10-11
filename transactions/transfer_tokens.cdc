import "FungibleToken"
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
}
