const db = require("../models");

// Defining methods for the userController
module.exports = {
    // find all users in a search, may not be used on the final website
    // but good for testing the user creation process
    findAllFriendRequests: function(req, res) {
        db.Relationship
            // this line is to test that the route works
            .find({ status: 0 , $or:[{ userOneId: req.user._id },{ userTwoId: req.user._id }]})
            // If we're able to successfully pull some relationships, let's start the recursion process to retrieve our friends
            .populate("userOneId")
            .populate("userTwoId")
            // because we need to interact with the relationship table, we'll need to set up the recursive statement on the front end
            // .then(dbRelationship => res.json(dbRelationship))
            .then(dbRelationship => {
                console.log(dbRelationship);
                // defining an empty array to put opposite user id in
                var friendList = [];
                // set up a counter to start at 0
                var i = 0;
                pushToFriendsList();
                // // if i is less than dbRelationship.length, continue the function
                function pushToFriendsList(){
                    if (i < dbRelationship.length) {
                        console.log("running length");
                        // we want to capture the user that isn't the one querying the list
                        if (dbRelationship[i].userOneId._id == req.user._id) {
                            // first we push the opposite id of the request user to friendsList
                            var relId = {
                                _id: dbRelationship[i]._id,
                                userTwoId: dbRelationship[i].userTwoId
                            };
                            friendList.push(relId);
                            // then increase i by one
                            i++;
                            console.log(i);
                            // then we call the function again
                            pushToFriendsList();
                        } else if (dbRelationship[i].userTwoId._id == req.user._id){
                            // push opposite id of the request user to friendsList
                            // increase i by one
                            var relId = {
                                _id: dbRelationship[i]._id,
                                userOneId: dbRelationship[i].userOneId
                            };
                            friendList.push(relId);
                            i++;
                            console.log(i);
                            // call the function again
                            pushToFriendsList();
                        }   else {
                            return;
                        }
                    } else {
                        return res.json(friendList);
                    }
                }
            })
            .catch(err => res.status(422).json(err));
    },
    checkFriendStatus: function(req, res) {
        db.Relationship
            // this will test that the route works
            // this route will be a test to see if the user is friends with the other user
            .findOne({ $or:[{ userOneId: req.body._id },{ userTwoId: req.body._id }]},
                { $or:[{ userOneId: req.params._id },{ userTwoId: req.params._id }]})
            .then(dbFriendShip => res.json(dbFriendShip))
            .catch(err => res.status(422).json(err));
    },
    // for finding all friends of a user in a search
    findAllFriends: function(req, res) {
        // console.log(req.body);
        db.Relationship
            // testing in postman
            // .find(req.body)
            // testing in production
            .find({ status: 1 , $or:[{ userOneId: req.user._id },{ userTwoId: req.user._id }]})
            // If we're able to successfully pull some relationships, let's start the recursion process to retrieve our friends
            .populate("userOneId")
            .populate("userTwoId")
            .then(dbRelationship => {
                console.log(dbRelationship);
                // defining an empty array to put opposite user id in
                var friendList = [];
                // set up a counter to start at 0
                var i = 0;
                pushToFriendsList();
                // // if i is less than dbRelationship.length, continue the function
                function pushToFriendsList(){
                    if (i < dbRelationship.length) {
                        console.log("running length");
                        // we want to capture the user that isn't the one querying the list
                        if (dbRelationship[i].userOneId._id == req.user._id) {
                            // first we push the opposite id of the request user to friendsList
                            // console.log("running push");
                            friendList.push(dbRelationship[i].userTwoId);
                            // then increase i by one
                            i++;
                            console.log(i);
                            // then we call the function again
                            pushToFriendsList();
                        } else if (dbRelationship[i].userTwoId._id == req.user._id){
                            // console.log("running else push");
                            // push opposite id of the request user to friendsList
                            friendList.push(dbRelationship[i].userOneId);
                            // increase i by one
                            i++;
                            console.log(i);
                            // call the function again
                            pushToFriendsList();
                        }   else {
                            return;
                        }
                    } else {
                        return res.json(friendList);
                    }
                }
            })
            .catch(err => res.status(422).json(err));
    },
    // for creating a Relationship, the req.body should have first name, last name, email and password
    addFriendRequest: function(req, res) {
        db.Relationship
            .create(req.body)
            .then(dbRelationship => res.json(dbRelationship))
            .catch(err => res.status(422).json(err));
    },
    // for accepting a friendship that was requested, will not necessarily need a body, but needs params to identify which relationship we're updating
    acceptFriend: function(req, res) {
        console.log(req.body);
        db.Relationship
            .findOneAndUpdate({ _id:req.params.id },{ status: 1 }, { new: true })
            .then(dbRelationship => res.json(dbRelationship))
            .catch(err => res.status(422).json(err));
    },
    // for denying a friendship, do not need to have a status, but will need to delete the request id
    denyRequest: function(req, res) {
        db.Relationship
            .deleteOne({ _id: req.params.id })
            .then(dbRelationship => res.json(dbRelationship))
            .catch(err => res.status(422).json(err));
    }
};