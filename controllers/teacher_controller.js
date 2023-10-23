const { User } = require("../models");

const teacherCtrl = {
  becomeTeacher: async (req, res, next) => {
    try {
      const { email } = req.body;
      // let user = await User.findOne({ email });
      await User.findOneAndUpdate(
        {
          email,
        },
        { role: "teacher" },
        { new: true }
      );
    } catch (error) {
      next(error);
    }
  },
};
module.exports = teacherCtrl;
