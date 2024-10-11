import { jest } from '@jest/globals';
import { configure, getAccountSummary } from '../flow';
import * as fcl from '@onflow/fcl';
import { Balance } from '@/types/flow';

/*
This file tests the flow service which needs a valid configured flow emulator environment to work
*/

const emulatorServiceAccountAddress = "0xf8d6e0586b0a20c7"

describe('flow service', () => {
    beforeAll(() => {
        configure("emulator")
    });

    describe('getAccountSummary', () => {
        it('should return account summary for valid address', async () => {
            const result = await getAccountSummary(emulatorServiceAccountAddress);
            
            expect(result).not.toBeNull()
            expect(Number(result?.flowAvailableBalance)).toBeGreaterThan(9999)

            const flowTokenBalance = result?.balances?.find((balance: Balance) => balance.vaultType.includes("FlowToken"))
            expect(Number(flowTokenBalance?.vaultBalance)).toBeGreaterThan(9999)
        });
    });
});