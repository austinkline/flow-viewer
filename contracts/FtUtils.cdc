import "FungibleToken"
import "FungibleTokenMetadataViews"
import "MetadataViews"

access(all) contract FtUtils {
    access(all) struct Display {
        access(all) let name: String
        access(all) let symbol: String
        access(all) let description: String
        access(all) let externalURL: String
        access(all) let logos: [Media]
        access(all) let socials: {String: String}

        init(_ d: FungibleTokenMetadataViews.FTDisplay) {
            self.name = d.name
            self.symbol = d.symbol
            self.description = d.description
            self.externalURL = d.externalURL.url
            
            self.logos = []
            for m in d.logos.items {
                self.logos.append(Media(m))
            }

            self.socials = {}
            for s in d.socials.keys {
                self.socials[s] = d.socials[s]!.url
            }
        }
    }

    access(all) struct Data {
        access(all) let storagePath: StoragePath
        access(all) let receiverPath: PublicPath
        access(all) let metadataPath: PublicPath

        init(_ d: FungibleTokenMetadataViews.FTVaultData) {
            self.storagePath = d.storagePath
            self.receiverPath = d.receiverPath
            self.metadataPath = d.metadataPath
        }
    }

    access(all) struct Media {
        access(all) let url: String
        access(all) let mediaType: String

        init(_ m: MetadataViews.Media) {
            self.url = m.file.uri()
            self.mediaType = m.mediaType
        }
    }

    access(all) struct Summary {
        access(all) let flowBalance: UFix64
        access(all) let flowAvailableBalance: UFix64
        access(all) let balances: [Balance]

        init(flowBalance: UFix64, flowAvailableBalance: UFix64, balances: [Balance]) {
            self.flowBalance = flowBalance
            self.flowAvailableBalance = flowAvailableBalance
            self.balances = balances
        }
    }

    access(all) struct Balance {
        access(all) let vaultBalance: UFix64
        access(all) let storagePath: StoragePath
        access(all) let vaultType: String
        access(all) let display: Display?
        access(all) let vaultData: Data?

        init(
            vaultBalance: UFix64,
            storagePath: StoragePath,
            vaultType: String,
            display: FungibleTokenMetadataViews.FTDisplay?,
            vaultData: FungibleTokenMetadataViews.FTVaultData?
        ) {
            self.vaultBalance = vaultBalance
            self.storagePath = storagePath
            self.vaultType = vaultType
            self.display = display != nil ? Display(display!) : nil
            self.vaultData = vaultData != nil ? Data(vaultData!) : nil
        }
    }

    access(all) fun resolveAccountBalances(acct: auth(BorrowValue) &Account): Summary? {
        let balances: [Balance] = []

        let ftType = Type<@{FungibleToken.Vault}>()
        acct.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
            if type.isRecovered {
                return true
            }

            if !type.isSubtype(of: ftType) {
                return true
            }

            if let b = self.processStoragePath(acct, path) {
                balances.append(b)
            }

            return true
        })

        let summary = Summary(flowBalance: acct.balance, flowAvailableBalance: acct.availableBalance, balances: balances)
        return summary
    }

    access(all) fun processStoragePath(_ acct: auth(BorrowValue) &Account, _ path: StoragePath): Balance? {
        let tmp = acct.storage.borrow<&{FungibleToken.Vault}>(from: path)
        if tmp == nil {
            return nil
        }
        let vault = tmp!

        let display = vault.resolveView(Type<FungibleTokenMetadataViews.FTDisplay>()) as! FungibleTokenMetadataViews.FTDisplay?
        let data = vault.resolveView(Type<FungibleTokenMetadataViews.FTVaultData>()) as! FungibleTokenMetadataViews.FTVaultData?
        
        return Balance(vaultBalance: vault.balance, storagePath: path, vaultType: vault.getType().identifier, display: display, vaultData: data)
    }
}