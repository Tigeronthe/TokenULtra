pragma solidity 0.7.0;

import "./IERC20.sol";
import "./IMintableToken.sol";
import "./IDividends.sol";
import "./SafeMath.sol";

contract Token is IERC20, IMintableToken, IDividends {
  // ------------------------------------------ //
  // ----- BEGIN: DO NOT EDIT THIS SECTION ---- //
  // ------------------------------------------ //
  using SafeMath for uint256;
  uint256 public totalSupply;
  uint256 public decimals = 18;
  string public name = "Test token";
  string public symbol = "TEST";
  mapping (address => uint256) public balanceOf;
  // ------------------------------------------ //
  // ----- END: DO NOT EDIT THIS SECTION ------ //  
  // ------------------------------------------ //

  // IERC20

  mapping (address => mapping (address => uint256)) private allowances;
  address[] private tokenHolders;
  mapping (address => uint256) private tokenHolderIndexes;
  mapping (address => uint256) private withdrawableDividends;

  function _addTokenHolder(address holder) internal {
    if (tokenHolderIndexes[holder] == 0) {
      tokenHolders.push(holder);
      tokenHolderIndexes[holder] = tokenHolders.length;
    }
  }

  function _removeTokenHolder(address holder) internal {
    uint256 index = tokenHolderIndexes[holder];
    if (index == 0) {
      return;
    }

    uint256 lastIndex = tokenHolders.length;
    if (index != lastIndex) {
      address lastHolder = tokenHolders[lastIndex - 1];
      tokenHolders[index - 1] = lastHolder;
      tokenHolderIndexes[lastHolder] = index;
    }

    tokenHolders.pop();
    delete tokenHolderIndexes[holder];
  }

  function _updateHolder(address holder) internal {
    if (balanceOf[holder] == 0) {
      _removeTokenHolder(holder);
    } else {
      _addTokenHolder(holder);
    }
  }

  function _transfer(address from, address to, uint256 value) internal {
    require(to != address(0));
    require(balanceOf[from] >= value);

    balanceOf[from] = balanceOf[from].sub(value);
    balanceOf[to] = balanceOf[to].add(value);
    _updateHolder(from);
    _updateHolder(to);
  }

  function allowance(address owner, address spender) external view override returns (uint256) {
    return allowances[owner][spender];
  }

  function transfer(address to, uint256 value) external override returns (bool) {
    _transfer(msg.sender, to, value);
    return true;
  }

  function approve(address spender, uint256 value) external override returns (bool) {
    allowances[msg.sender][spender] = value;
    return true;
  }

  function transferFrom(address from, address to, uint256 value) external override returns (bool) {
    require(allowances[from][msg.sender] >= value);
    allowances[from][msg.sender] = allowances[from][msg.sender].sub(value);
    _transfer(from, to, value);
    return true;
  }

  // IMintableToken

  function mint() external payable override {
    require(msg.value > 0);
    balanceOf[msg.sender] = balanceOf[msg.sender].add(msg.value);
    totalSupply = totalSupply.add(msg.value);
    _addTokenHolder(msg.sender);
  }

  function burn(address payable dest) external override {
    uint256 amount = balanceOf[msg.sender];
    require(amount > 0);

    balanceOf[msg.sender] = 0;
    totalSupply = totalSupply.sub(amount);
    _removeTokenHolder(msg.sender);
    dest.transfer(amount);
  }

  // IDividends

  function getNumTokenHolders() external view override returns (uint256) {
    return tokenHolders.length;
  }

  function getTokenHolder(uint256 index) external view override returns (address) {
    if (index == 0 || index > tokenHolders.length) {
      return address(0);
    }
    return tokenHolders[index - 1];
  }

  function recordDividend() external payable override {
    require(msg.value > 0);
    require(totalSupply > 0);

    for (uint256 i = 0; i < tokenHolders.length; i += 1) {
      address holder = tokenHolders[i];
      uint256 dividend = msg.value.mul(balanceOf[holder]).div(totalSupply);
      withdrawableDividends[holder] = withdrawableDividends[holder].add(dividend);
    }
  }

  function getWithdrawableDividend(address payee) external view override returns (uint256) {
    return withdrawableDividends[payee];
  }

  function withdrawDividend(address payable dest) external override {
    uint256 amount = withdrawableDividends[msg.sender];
    withdrawableDividends[msg.sender] = 0;
    dest.transfer(amount);
  }
}