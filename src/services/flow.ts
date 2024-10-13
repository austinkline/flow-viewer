import { config } from '@onflow/fcl';
import flowJSON from '../../flow.app.json'
import { AccountSummary, Balance } from '@/types/flow';

import * as fcl from '@onflow/fcl';
import { TransactionStatus } from '@onflow/typedefs';
import { Truculenta } from 'next/font/google';

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

export const networkFromAddress = (address: string): string => {
    // Explanation:
    // 1. Remove the '0x' prefix from the address using slice(2)
    // 2. Create a new Uint8Array of length 8
    // 3. Iterate 8 times, each time taking 2 characters from the address
    // 4. Parse these 2 characters as a hexadecimal number and store it in the array
    const withoutPrefix = address.slice(2);
    const uint8Array = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        // The 16 here specifies the radix (base) for parsing the string.
        uint8Array[i] = parseInt(withoutPrefix.slice(i * 2, i * 2 + 2), 16);
    }

    // Next, convert this array of 8 bytes into a number
    const addressNumber = uint8Array.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
    for (const network in networkCodeWords) {
        if (isNumberInNetwork(addressNumber, network)) {
            return network;
        }
    }

    return "";
}

const isNumberInNetwork = (number: bigint, network: string): boolean => {
    var parity = 0n;
    var codeword: bigint = networkCodeWords[network];
    codeword = codeword ^ number;
    if (codeword === 0n) {
        return false;
    }

    for (let i = 0; i < parityCheckMatrix.length; i++) {
        const column = parityCheckMatrix[i];
        if((codeword & 1n) === 1n) {
            parity = parity ^ BigInt(column);
        }
        codeword = codeword >> 1n;
    }

    return parity === 0n && codeword === 0n;
}


const networkCodeWords: Record<string, bigint> = {
    mainnet: 0n,
    testnet: 0x6834ba37b3980209n,
    emulator: 0x1cb159857af02018n
}

const parityCheckMatrix = [
    0x00001, 0x00002, 0x00004, 0x00008, 0x00010, 0x00020, 0x00040, 0x00080,
    0x00100, 0x00200, 0x00400, 0x00800, 0x01000, 0x02000, 0x04000, 0x08000,
    0x10000, 0x20000, 0x40000, 0x7328d, 0x6689a, 0x6112f, 0x6084b, 0x433fd,
    0x42aab, 0x41951, 0x233ce, 0x22a81, 0x21948, 0x1ef60, 0x1deca, 0x1c639,
    0x1bdd8, 0x1a535, 0x194ac, 0x18c46, 0x1632b, 0x1529b, 0x14a43, 0x13184,
    0x12942, 0x118c1, 0x0f812, 0x0e027, 0x0d00e, 0x0c83c, 0x0b01d, 0x0a831,
    0x0982b, 0x07034, 0x0682a, 0x05819, 0x03807, 0x007d2, 0x00727, 0x0068e,
    0x0067c, 0x0059d, 0x004eb, 0x003b4, 0x0036a, 0x002d9, 0x001c7, 0x0003f
]