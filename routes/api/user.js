const router = require("express").Router();
const userController = require("../../controllers/userController");
const isAuthenticated = require("../../config/middleware/isAuthenticated");

// Matches with "/api/users/"
router
  .route("/:id")
  .delete(isAuthenticated, userController.deleteUser)
  
// Find all for users
router
  .route("/")
  .put(isAuthenticated, userController.editUser)
  .post(userController.createUser)

router
  .route("/me")
    .get(isAuthenticated, function(req, res) {
      res.json(req.user);
    })

router
  .route("/view/:id")
  .get(userController.findOtherUser)

router
    .route("/?")
    .get(isAuthenticated, userController.findAll)

  module.exports = router;