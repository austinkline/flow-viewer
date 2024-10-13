import { jest } from '@jest/globals';
import { configure, getAccountSummary, networkFromAddress } from '../flow';
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

    describe('networkFromAddress', () => {
        it('should match emulator address', () => {
            const network = networkFromAddress(emulatorServiceAccountAddress);
            expect(network).toBe("emulator");
        });
        
        it('should match testnet address', () => {
            const network = networkFromAddress("0x40387cea622425a3");
            expect(network).toBe("testnet");
        });

        it('should match mainet address', () => {
            const network = networkFromAddress("0x455eb332c23a23e8");
            expect(network).toBe("mainnet");
        });
    });
});
