// SPDX-License-Identifier: UNLICENSED
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

import {Script, console} from "forge-std/Script.sol";
import '../src/IRedistributionManager.sol';
import '../src/RedistributionLogic.sol';

// How to:
// Either `source ../../.env` or replace variables in command.
// forge script RedistributionLogicDeploy --rpc-url $L2_RPC --private-key $PRIVATE_KEY
// --broadcast -vvvv --verify --etherscan-api-key $L2_ETHERSCAN_API_KEY --chain
// $L2_CHAIN --verifier-url $L2_VERIFIER_URL --sig="run(address)" $ATTESTATION_CENTER_ADDRESS
contract RedistributionLogicDeploy is Script {
    function setUp() public {}

    function run(address redistributionManager) public {
        vm.startBroadcast();
        SimpleRedistributionLogic redistributionLogic = new SimpleRedistributionLogic(redistributionManager);
        console.log("RedistributionLogic deployed at:", address(redistributionLogic));

        IRedistributionManager(redistributionManager).queueRedistributionLogic(address(redistributionLogic));
        vm.stopBroadcast();
    }
}

// forge script RedistributionLogicDeploy --fork-url https://1rpc.io/sepolia --private-key 127454b08d474a4b061c6e80c44cf8f58e67c2d7e66e2494016f8f000e01d8cc --broadcast -vvvv --verify --etherscan-api-key 7DT963WGDMM4XJRGTDYFTPJKSKY2TKI1YF --chain 11155111 --sig="run(address)" 0x6688471158a84a04e9241f01fbd6432dd3aad565