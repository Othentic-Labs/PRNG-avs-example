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

import "./IAttestationCenter.sol";

/**
 * @author Othentic Labs LTD.
 * @notice Terms of Service: https://www.othentic.xyz/terms-of-service
 */
interface IAvsLogic {
     function afterTaskSubmission(IAttestationCenter.TaskInfo calldata _taskInfo, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _operatorIds) external;
     function beforeTaskSubmission(IAttestationCenter.TaskInfo calldata _taskInfo, bool _isApproved, bytes calldata _tpSignature, uint256[2] calldata _taSignature, uint256[] calldata _operatorIds) external;
}

