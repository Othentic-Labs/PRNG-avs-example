// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.20;

/*______     __      __                              __      __ 
 /      \   /  |    /  |                            /  |    /  |
/$$$$$$  | _$$ |_   $$ |____    ______   _______   _$$ |_   $$/   _______ 
$$ |  $$ |/ $$   |  $$      \  /      \ /       \ / $$   |  /  | /       |
$$ |  $$ |$$$$$$/   $$$$$$$  |/$$$$$$  |$$$$$$$  |$$$$$$/   $$ |/$$$$$$$/ 
$$ |  $$ |  $$ | __ $$ |  $$ |$$    $$ |$$ |  $$ |  $$ | __ $$ |$$ |
$$ \__$$ |  $$ |/  |$$ |  $$ |$$$$$$$$/ $$ |  $$ |  $$ |/  |$$ |$$ \_____ 
$$    $$/   $$  $$/ $$ |  $$ |$$       |$$ |  $$ |  $$  $$/ $$ |$$       |
 $$$$$$/     $$$$/  $$/   $$/  $$$$$$$/ $$/   $$/    $$$$/  $$/  $$$$$$$/
*/
/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
// /PRNG-avs-example/contracts/lib/eigenlayer-contracts/src/contracts/interfaces/IStrategy.sol
import {IStrategy} from "../lib/eigenlayer-contracts/src/contracts/interfaces/IStrategy.sol";
import {ISlashingConfig} from "./ISlashingConfig.sol";

interface IRedistributionManager {
    struct SlashDetails {
        bool isReleased;
        bool isRedistributed;
        address operator;
        uint32 blockNumber;
        IStrategy[] eigenStrategies;
        uint256[] sharesSlashed;
        ISlashingConfig.SlashingCondition slashingCondition;
    }
    function queueRedistributionLogic(address _redistributionLogic) external;
    function completeRedistributionLogic() external;
}