const Group = require('../model/group.model');

const createOrUpdateGroup = async (groupBody) => {
  let group = await Group.findOne({ groupId: groupBody.groupId });
  if (!group) {
    group = new Group(groupBody);
  } else {
    group.groupName = groupBody.groupName;
    group.adminId = groupBody.adminId;
  }
  await group.save();
  return group;
};

const getGroupByGroupId = async (groupId) => {
  const group = await Group.findOne({ groupId });
  if (!group) {
    throw new Error('Group not found');
  }
  return group;
};

const updateGroupId = async (oldGroupId, newGroupId) => {
  const group = await Group.findOneAndUpdate({ groupId: oldGroupId }, { groupId: newGroupId }, { new: true });
  if (!group) {
    throw new Error('Group not found');
  }
  return group;
};

const updateGroupName = async (groupId, newGroupName) => {
  const group = await Group.findOneAndUpdate({ groupId }, { groupName: newGroupName }, { new: true });
  if (!group) {
    throw new Error('Group not found');
  }
  return group;
};

module.exports = {
  createOrUpdateGroup,
  getGroupByGroupId,
  updateGroupId,
  updateGroupName,
};
