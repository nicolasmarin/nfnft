const protocol = "XDCx Stader";
const STAKE_MANAGER = "0x7276241a669489E4BBB76f63d2A43Bfe63080F2F";
const REWARD_EVENT = "event Redelegate(uint256 _rewardsId, uint256 _amount)";
const REWARD_DELAY_HOURS = 24;
const REWARD_CHANGE_BPS = 50; // 0 - 10_000
const TOTAL_BPS = 10000;

const START_DELEGATION_FN = "function startDelegation()";
const START_DELEGATION_DELAY = 36;

const COMPLETE_DELEGATION_FN = "function completeDelegation(uint256 _uuid)";
const COMPLETE_DELEGATION_DELAY = 12;

const START_UNDELEGATION_FN = "function startUndelegation()";
const START_UNDELEGATION_DELAY = 169;

const UNDELEGATION_UPDATE_FN = "function undelegationStarted(uint256 _uuid)";
const UNDELEGATION_UPDATE_DELAY = 12;

const COMPLETE_UNDELEGATION_FN = "function completeUndelegation(uint256 _uuid)";
const COMPLETE_UNDELEGATION_DELAY = 193;

export {
  protocol,
  REWARD_EVENT,
  REWARD_DELAY_HOURS,
  STAKE_MANAGER,
  REWARD_CHANGE_BPS,
  TOTAL_BPS,
  START_DELEGATION_FN,
  START_DELEGATION_DELAY,
  COMPLETE_DELEGATION_FN,
  COMPLETE_DELEGATION_DELAY,
  START_UNDELEGATION_FN,
  START_UNDELEGATION_DELAY,
  UNDELEGATION_UPDATE_FN,
  UNDELEGATION_UPDATE_DELAY,
  COMPLETE_UNDELEGATION_FN,
  COMPLETE_UNDELEGATION_DELAY,
};
