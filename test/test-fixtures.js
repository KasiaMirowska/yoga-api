const { makePosesArray } = require('./test-data-helpers');
const { makeUsersArray } = require('./test-data-helpers');
const { makeFlowsArray } = require('./test-data-helpers');
const { makeSectionFlowsArray } = require('./test-data-helpers');
const { makeFlowsPosesArray } = require('./test-data-helpers');
const { makeNotesArray } = require('./test-data-helpers');
const { makeAttributesArray } = require('./test-data-helpers');
const { makeTestFixtures } = require('./test-data-helpers');
const { makeMaliciousPose } = require('./test-data-helpers');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
            yoga_poses,
            users,
            flows,
            section_flows,
            flows_poses,
            pose_notes,
            pose_attributes
            RESTART IDENTITY CASCADE`
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));
    return db
        .into('users')
        .insert(preppedUsers)
        // .then(() => db.raw(`SELECT setval('users_seq_id', ?)`, [users[users.length - 1].id]))// since my DB has primary key then I cant use that right?
        .then(() => {
            console.log('users populated')
        })
}
function seedPosesForLoggedIn(db, users, poses) {
    const protectedUsers = seedUsers(users);
    return db
        .into('users')
        .insert(protectedUsers)
        .then(() => 
            db
                .into('yoga_poses')
                .insert(poses)
        )
        .then(() => {
            console.log('poses for loggedin user populated')
        })
}


function makeExpectedListPose(pose) {
    return ({
        id: pose.id,
        name_eng: pose.name_eng,
        alias: pose.alias,
        name_san: pose.name_san,
        pose_type: pose.pose_type,
        pose_level: pose.pose_level,
        img: pose.img
    })
}
function makeExpectedFullPose(pose) {
    return ({
        id: pose.id,
        name_eng: pose.name_eng,
        alias: pose.alias,
        name_san: pose.name_san,
        benefits: pose.benefits,
        pose_type: pose.pose_type,
        pose_level: pose.pose_level,
        img: pose.img,
        video: pose.video,
    })
}

function makeAuthHeader(user, secret=process.env.JWT_SECRET) {
    const token = jwt.sign({user_id: user.id}, secret, {
        subject: user.username,
        algorithm: 'HS256'
    })
    return `Bearer ${token}`
}

module.exports = {
    makeExpectedListPose,
    makeExpectedFullPose,
    cleanTables,  
    seedUsers,
    //seedPosesForLoggedIn,
    makeAuthHeader,
}