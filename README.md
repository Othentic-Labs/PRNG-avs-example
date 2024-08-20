# 🍀 Othentic PRNG AVS Example

The othentic CLI can be used to create any AVS with just a few lines of code in any language you prefer. Let's look at an example for a pseudo random number generator. We provide a sample docker-compose configuration which sets up the following services:
- Aggregator node
- 3 Attester nodes
- AVS WebAPI endpoint
- Sync service for operators

## Run the demo

To run the Pseudo-Random Number Generator AVS demo, you must first deploy an instance of the `PRNG` contract.

```bash
cd contracts/
forge install
```
Run the install script:
```bash
forge script PRNGDeploy --rpc-url $L2_RPC --private-key $PRIVATE_KEY --broadcast -vvvv --verify --etherscan-api-key $L2_ETHERSCAN_API_KEY --chain $L2_CHAIN --verifier-url $L2_VERIFIER_URL --sig="run(address)" $ATTESTATION_CENTER_ADDRESS
```

Now go back to the root of the repository and run the docker compose configuration:
```bash
docker-compose up --build
```
> [!NOTE]
> Building the images might take a few minutes

## Updating the Othentic node version

To update the othentic-cli inside the docker images to the latest version, you need to rebuild the images using the following command:
```bash
docker-compose build --no-cache
```

## 🏗️ Architecture
The Othentic Attester nodes communicate with an AVS WebAPI endpoint which
validates tasks on behalf of the nodes. The attesters then sign the tasks based
on the AVS WebAPI response.

Attester nodes can either all communicate with a centralized endpoint or each
implement their own validation logic.

### AVS WebAPI
```
POST task/validate returns (bool) {"proofOfTask": "{proofOfTask}"};
```
