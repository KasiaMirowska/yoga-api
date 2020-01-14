
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
    console.log(db, 'DATABASE!!!!2222222222222')
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
function seedPosesAttributes(db, users, poses, attributes) {

    const protectedUsers = seedUsers(users);
    return db
        .into('users')
        .insert(protectedUsers)
        .then(() =>
            db
                .into('yoga_poses')
                .insert(poses)
                .then(() => {
                    db
                        .into('pose_attributes')
                        .insert(attributes)
                        .then(() => {
                            console.log('attributes populated')
                        })
                })
        )
}

function seedPosesNotes(db, users, poses, notes) {
    const protectedUsers = seedUsers(users);
    return db
        .into('users')
        .insert(protectedUsers)
        .then(() =>
            db
                .into('yoga_poses')
                .insert(poses)
                .then(() => {
                    db
                        .into('pose_notes')
                        .insert(notes)
                        .then(() => {
                            console.log('notes populated')
                        })
                })
        )
}

function seedPosesAttNotes(db, users, poses, attributes, notes) {
    const protectedUsers = seedUsers(users);
    return db
        .into('users')
        .insert(protectedUsers)
        .then(() =>
            db
                .into('yoga_poses')
                .insert(poses)
                .then(() => {
                    db
                        .into('pose_attributes')
                        .insert(attributes)
                        .then(() => {
                            db
                                .into('pose_notes')
                                .insert(notes)
                                .then(() => {
                                    console.log('pose attNotes populated')
                                })
                        })
                })
        )

}


function makeExpectedListPose(pose) {
    return ({
        id: pose.id,
        name_eng: pose.name_eng,
        alias: pose.alias,
        name_san: pose.name_san,
        benefits: '',
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

function makeExpectedPoseAttributes(user, pose, flowId, attributes) {
    const poseAttributes = attributes.filter(att => att.author === user.id)
    const newerPoseAttributes = poseAttributes.filter(att => att.assigned_flow_id === flowId);
    const newestPoseAttributes = newerPoseAttributes.filter(att => att.pose_id === pose.id)
    let attributesList = {};
    newestPoseAttributes.forEach(att => attributesList[att.attribute] = true)
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
        attributesList: Object.keys(attributesList),
    })
}

function makeExpectedPoseNotes(user, pose, flowId, notes) {
    const poseNotes = notes.filter(n => n.author === user.id)
    const newerPoseNotes = poseNotes.filter(n => n.assigned_flow_id === flowId);
    const newestPoseNotes = newerPoseNotes.filter(n => n.pose_id === pose.id)
    let notesList = {};
    newestPoseNotes.forEach(n => notesList[n.notes] = true)

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
        notes: Object.keys(notesList)
    })
}

function makeExpectedPoseAttNotes(user, pose, flowId, attributes, notes) {
    const poseAtt = makeExpectedPoseAttributes(user, pose, flowId, attributes)
    const poseNote = makeExpectedPoseNotes(user, pose, flowId, notes)
    return ({
        ...poseAtt,
        notes: poseNote.notes,
    })
}


function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256'
    })
    console.log('HERE?????????????1111', token)
    return `Bearer ${token}`
}

module.exports = {
    makeExpectedListPose,
    makeExpectedFullPose,
    makeExpectedPoseAttributes,
    makeExpectedPoseNotes,
    makeExpectedPoseAttNotes,
    cleanTables,
    // seedUsers,
    // seedPosesForLoggedIn,
    // seedPosesAttributes,
    // seedPosesNotes,
    makeAuthHeader,
}