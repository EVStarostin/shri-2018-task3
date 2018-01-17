module.exports.index = function (req, res) {
  res.sendfile('public/index.html');
};

module.exports.newmeeting = function (req, res) {
  res.sendfile('public/newmeeting.html');
};

module.exports.editmeeting = function (req, res) {
  res.sendfile('public/editmeeting.html');
};