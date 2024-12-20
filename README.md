# PRNG AVS Example

This repository demonstrates the implementation of a leader election algorithm for Task Performers. Learn more about task allocation to different nodes in the [official documentation](https://docs.othentic.xyz/main/avs-framework/othentic-consensus/task-and-task-definitions#task-allocation-to-operators).

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Architecture](#usage)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Usage](#usage)

## Overview

This repository provides:
- An implementation of a leader election algorithm for Task Performers.
- A pseudo-random number generator (PRNG) implementation using [AVS Logic Hook](https://docs.othentic.xyz/main/avs-framework/smart-contracts/hooks/task-logic). The PRNG smart contract implements the logic for generating a pseudo-random number after task execution.

## Project Structure

```mdx
📂 PRNG-avs-example
├── attester  # Implements task execution and validation logic
├── contracts # PRNG contract and scripts
├── docker-compose.yml # # Docker setup for Operator Nodes including Attesters, and Aggregator
└── README.md          # Project documentation
```

## Architecture
### Task Performer Selection (Round Robin):
- The task performer is selected in a round-robin manner by computing `blockNumber % numOfOperators`, ensuring each operator performs tasks in a fair and predictable order.

### Task Execution logic:
- Once an operator is selected to perform a task, they generate a proof (a combination of block number and timestamp) and sign it with their private key. This proof is sent to the attester node to confirm that the task was performed.

### Validation Service logic:
- The server exposes an endpoint `/task/validate` for validating the task performance. This endpoint checks if the provided task proof corresponds to the correct performer for the specified block number.

### Task Flow
1. The system listens for new blocks.
2. Every 20th block selects a task performer.
3. If the current block is the performer's turn, the task is executed, and a proof is generated.
4. The proof is sent to the attester node.
5. The /task/validate endpoint is called internally, to check if the task was performed by the correct operator.


## Prerequisites

- Node.js (v 22.6.0 )
- Foundry
- [Yarn](https://yarnpkg.com/)
- [Docker](https://docs.docker.com/engine/install/)


## Usage
1. Create a .env file and include the contract addresses and private keys for the operators.

2. First, deploy an instance of the `PRNG contract` by navigating to the `contracts` directory:

```bash
cd contracts/
forge install
```
3. Run the installation script to deploy the contract:
```bash
forge script PRNGDeploy --rpc-url $L2_RPC --private-key $PRIVATE_KEY --broadcast -vvvv --verify --etherscan-api-key $L2_ETHERSCAN_API_KEY --chain $L2_CHAIN --verifier-url $L2_VERIFIER_URL --sig="run(address)" $ATTESTATION_CENTER_ADDRESS
```

4. Once the contract is deployed, return to the root of the repository and start the Docker Compose configuration:
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
