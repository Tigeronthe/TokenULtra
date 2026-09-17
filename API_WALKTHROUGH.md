# Smart Contract API Walkthrough

This guide explains how to start the backend, invoke the public smart-contract endpoints, inspect the responses, and merge the changes into another branch.

## Prerequisites

- Node.js installed
- Dependencies installed in this project
- Internet access for the configured Ethereum RPC endpoint

From PowerShell:

```powershell
cd C:\testtoken\initial-rwa-poc
npm install
```

## Start the API

Port `3010` avoids conflicts with other local services:

```powershell
cd C:\testtoken\initial-rwa-poc
$env:PORT="3010"
npm start
```

Expected startup output:

```text
Server running on http://localhost:3010
```

Keep this terminal open. Open a second PowerShell terminal to invoke the endpoints.

## Invoke Requests

### WETH metadata and current block

```powershell
Invoke-WebRequest http://localhost:3010/FardeenApiTest -UseBasicParsing
```

Returns the public WETH contract address, token name, symbol, decimals, total supply, and current Ethereum block number.

### Chainlink ETH/USD price

```powershell
Invoke-WebRequest http://localhost:3010/third-contract -UseBasicParsing
```

Returns the ETH/USD price, Chainlink round ID, update time, and raw oracle answer.

### WETH balance

Uses the default demo wallet:

```powershell
Invoke-WebRequest http://localhost:3010/public-weth/balance -UseBasicParsing
```

Query a different Ethereum wallet:

```powershell
$wallet = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
Invoke-WebRequest "http://localhost:3010/public-weth/balance?address=$wallet" -UseBasicParsing
```

An invalid address returns HTTP `400`.

### USDC total supply

```powershell
Invoke-WebRequest http://localhost:3010/public-usdc/supply -UseBasicParsing
```

## Print JSON Clearly

`Invoke-WebRequest` returns the body as text. To format the JSON response:

```powershell
$response = Invoke-WebRequest http://localhost:3010/FardeenApiTest -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

## Test All Endpoints

```powershell
$baseUrl = "http://localhost:3010"
$routes = @(
  "/FardeenApiTest",
  "/third-contract",
  "/public-weth/balance",
  "/public-usdc/supply"
)

foreach ($route in $routes) {
  try {
    $response = Invoke-WebRequest "$baseUrl$route" -UseBasicParsing
    Write-Host "[$($response.StatusCode)] $route"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
  } catch {
    Write-Host "[FAILED] $route - $($_.Exception.Message)"
  }
}
```

## Stop the API

In the terminal running the server, press:

```text
Ctrl+C
```

## Merge the Changes

Check the current branch and working tree first:

```powershell
cd C:\testtoken\initial-rwa-poc
git status
git branch --show-current
```

Commit the API changes on the current feature branch:

```powershell
git add API_WALKTHROUGH.md src/server/server.js src/server/contractConfig.js
git commit -m "Add public smart contract API walkthrough"
```

Update the target branch, then merge the feature branch. Replace the branch names with your actual names:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git merge <feature-branch>
```

If Git reports conflicts:

```powershell
git status
# Edit the conflicted files and remove the conflict markers.
git add <resolved-file>
git commit
```

Verify the merge:

```powershell
node --check src/server/server.js
node --check src/server/contractConfig.js
git diff --check
git log --oneline -5
```

Push the merged branch:

```powershell
git push origin main
```

Do not use `git reset --hard` or discard unrelated local changes while resolving the merge.
