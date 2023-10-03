// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import 'hardhat/console.sol';
import './Token.sol';

contract Exchange {

    address public feeAccount;
    uint256 public feePercent;
    uint256 public orderCount;

    mapping (address => mapping (address => uint256)) public tokens;
    mapping (uint256 => _Order) public orders;
    mapping (uint256 => bool) public orderCancelled;

    event Deposit(address token, address user, uint256 value, uint256 balance);
    event Withdraw(address token, address user, uint256 value, uint256 balance);
    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _value) public {

        require(Token(_token).transferFrom(msg.sender, address(this), _value));

        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _value;

        emit Deposit(_token, msg.sender, _value, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _value) public {

        require(tokens[_token][msg.sender] >= _value);

        Token(_token).transfer(msg.sender, _value);

        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _value;

        emit Withdraw(_token, msg.sender, _value, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        
        return tokens[_token][_user];
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {

        require(tokens[_tokenGive][msg.sender] >= _amountGive);
        
        orderCount = orderCount + 1;

        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        
        _Order storage _order = orders[_id];

        require(_id > 0 && _order.id == _id);
        require(_order.user == msg.sender);

        orderCancelled[_id] = true;

        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);
    }
}
