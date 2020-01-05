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


function cleanTables(db) {
    return db.raw(
        `TRUNCATE
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
        .then(() => db.raw(`SELECT setval('users_seq_id', ?)`, [users[users.length - 1].id]))
}

function seedPoses(db) {
    const testPoses = makePosesArray()
    return db
        .into('yoga_poses')
        .insert(testPoses)
        .then(() =>
            db.raw(`SELECT setval('yoga_poses_seq_id', ?)`, [yoga_poses[yoga_poses.length - 1].id],
            ))
}

function makeExpectedListPose(pose) {
    return {
        id: pose.id,
        name_eng: pose.name_eng,
        name_san: pose.name_san,
        pose_type: pose.pose_type,
        pose_level: pose.pose_level,
        img: pose.img
    }
}

module.exports = {
    makeExpectedListPose,
    cleanTables,
    seedPoses,
    seedUsers,
}