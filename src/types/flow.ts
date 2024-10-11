export interface AccountSummary {
    flowBalance: string
    flowAvailableBalance: string
    balances: Balance[]
}

export interface Balance {
    vaultBalance: number
    storagePath: string
    vaultType: string
    display: FtDisplay | null
    vaultData: FtData | null
}

export interface FtDisplay {
    name: string
    symbol: string
    description: string
    externalUrl: string
    logos: Media[]
    socials: { [key: string]: string }
}

export interface FtData {
    storagePath: Path
    receiverPath: Path
    metadataPath: Path
}

export interface Media {
    url: string
    mediaType: string
}

export interface Path {
    domain: "public" | "storage"
    identifier: string
}