const roles = {
  user: "User",
  admin: "Admin",
  values: function  () { return [this.user,this.admin]; }
};

module.exports = {
  roles
};
