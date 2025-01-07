# PRNG AVS Example

This repository demonstrates the advanced features of the `othentic-cli`. It's recommended to set up the [simple-price-oracle-avs](https://github.com/Othentic-Labs/simple-price-oracle-avs-example) first before diving into more advanced features.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#usage)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Usage](#usage)

## Overview

This repository contains:
- **Leader Election Algorithm**: Implements a leader election algorithm to allocate task among multiple Performer nodes. Learn more about different task allocation mechanisms in the [official documentation](https://docs.othentic.xyz/main/avs-framework/othentic-consensus/task-and-task-definitions#task-allocation-to-operators).
- **AVS Logic Hook**: Hooks enable developers to integrate custom logic seamlessly. The pseudo-random number generator (PRNG) smart contract utilizes this feature to generate a pseudo-random number after task execution. Learn more about [AVS Logic Hook](https://docs.othentic.xyz/main/avs-framework/smart-contracts/hooks/task-logic). 
- **Custom Task trigger**: The Othentic framework provides flexibility to define custom logic for triggering tasks. In this example, Performer nodes monitor new blocks and execute a task every 20 blocks. Learn more about [Triggering a task](https://docs.othentic.xyz/main/avs-framework/othentic-consensus/task-and-task-definitions#triggering-a-task)

## Project Structure

```mdx
📂 PRNG-avs-example
├── Execution_Service  # Implements task execution and leader election logic
├── Validation_Service # Implements task validation logic
├── grafana            # Grafana monitoring configuration
├── contracts # PRNG contract and scripts
├── docker-compose.yml # # Docker setup for Operator Nodes (Performer, Attesters, Aggregator), Execution Service, Validation Service, and monitoring tools
└── README.md          # Project documentation
```

## Architecture
The Performer node executes tasks using the Task Execution Service and sends the results to the p2p network.

Attester Nodes validate task execution through the Validation Service. Based on the Validation Service's response, attesters sign the tasks. In this AVS:

### Leader election logic:
The task performer is selected in a round-robin manner by computing `blockNumber % numOfOperators`, ensuring each operator performs tasks in a fair and predictable order.
- The total number of operators is retrieved using the [numOfActiveOperators](https://github.com/Othentic-Labs/core-contracts/blob/main/src/NetworkManagement/L2/AttestationCenter.sol#L129) method in the attestation center contract.
- The operator's address is fetched using the [getOperatorPaymentDetail](https://github.com/Othentic-Labs/core-contracts/blob/main/src/NetworkManagement/L2/AttestationCenter.sol#L133) method by providing the operator ID.

### Task Execution logic:
Once an operator is selected to perform a task, they generate a proof (a combination of block number and timestamp) and sign it with their private key. This proof is sent to the attester node to confirm that the task was performed.

### Validation Service logic:
The server exposes an endpoint `/task/validate` for validating the task performance. This endpoint checks if the provided task proof corresponds to the correct performer for the specified block number.

### Task Flow
1. The Performer nodes listens for new blocks.
2. Every 20th block selects a task performer.
3. If the current block is the performer's turn, the task is executed, and a proof is generated.
4. The proof is sent to the attester node.
5. The `/task/validate` endpoint is called internally, to check if the task was performed by the correct operator.


## Prerequisites

- Node.js (v 22.6.0 )
- Foundry
- [Yarn](https://yarnpkg.com/)
- [Docker](https://docs.docker.com/engine/install/)


## Usage
1. Create a .env file and include the deployed contract addresses and private keys for the operators. If you are unfamiliar with AVS, Checkout the [Quickstart guide](https://docs.othentic.xyz/main/avs-framework/quick-start).

2. Deploy the PRNG Contract: To use hooks, deploy an instance of the `PRNG contract` by navigating to the `contracts` directory. Note that deploying this contract is optional; the AVS can run without it. This step is primarily for showcasing the use of hooks.

```bash
cd contracts/
forge install
forge script PRNGDeploy --fork-url $L2_RPC --private-key $PRIVATE_KEY --broadcast -vvvv --verify --etherscan-api-key $L2_ETHERSCAN_API_KEY --chain $L2_CHAIN --sig="run(address)" $ATTESTATION_CENTER_ADDRESS
```

3. Once the contract is deployed, return to the root of the repository and start the Docker Compose configuration:
```bash
docker-compose up --build
```
> [!NOTE]
> Building the images might take a few minutes

### Updating the Othentic node version

To update the `othentic-cli` inside the docker images to the latest version, rebuild the images using the following command:
```bash
docker-compose build --no-cache
```

### Next
Modify the different configurations, write your own leader election algorithm, and run the AVS.

Happy Building! 🚀
