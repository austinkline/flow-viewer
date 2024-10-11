export const getImageUrl = (uri: string) => {
    if (uri.startsWith("ipfs://")) {
        return `https://ipfs.io/ipfs/${uri.slice(7)}`;
    }

    return uri;
}