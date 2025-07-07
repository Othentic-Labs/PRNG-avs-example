// SPDX-License-Identifier: BUSL-1.1
pragma solidity >=0.8.25;

import {IRedistributionLogic} from "./IRedistributionLogic.sol";
import {IRedistributionManager} from "./IRedistributionManager.sol";

/**
 * @title SimpleRedistributionLogic
 * @dev Basic implementation of the IRedistributionLogic interface
 */
contract SimpleRedistributionLogic is IRedistributionLogic {
    address public redistributionManager;

    constructor(address _redistributionManager) {
        redistributionManager = _redistributionManager;
    }

    // Store the last slashId processed for tracking (optional)
    uint256 public lastSlashId;

    // Event for visibility
    event RedistributionExecuted(uint256 slashId, address slashedOperator);

    function redistribute(
        uint256 _slashId,
        IRedistributionManager.SlashDetails calldata _slashDetails
    ) external override {
        // Save the last slash ID
        lastSlashId = _slashId;

        // Emit an event showing redistribution occurred
        emit RedistributionExecuted(
            _slashId,
            _slashDetails.operator
        );

    }
}
