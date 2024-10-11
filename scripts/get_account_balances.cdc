/*
Get all token balances for an account. Also include a special fields for the Flow Token
to account for storage consumed as the balance of flow on a user's account isn't the same
as how many tokens they are able to withdraw
*/
import "FtUtils"

access(all) fun main(addr: Address): AnyStruct {
    let acct = getAuthAccount<auth(BorrowValue) &Account>(addr)
    return FtUtils.resolveAccountBalances(acct: acct)
}