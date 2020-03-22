function makePosesArray() {
    return [
        {
            id: 1,
            name_eng: 'test-pose 1',
            alias: 'alias1',
            name_san: 'san 1',
            benefits: 'pose1 benefits',
            pose_level: 'pose1 level',
            pose_type: 'pose1 type',
            img: 'image1',
            video: 'video1',
        },
        {
            id: 2,
            name_eng: 'test-pose 2',
            alias: 'alias2',
            name_san: 'san 2',
            benefits: 'pose2 benefits',
            pose_level: 'pose2 level',
            pose_type: 'pose2 type',
            img: 'image2',
            video: 'video2',
        },
        {
            id: 3,
            name_eng: 'test-pose 3',
            alias: 'alias3',
            name_san: 'san 3',
            benefits: 'pose3 benefits',
            pose_level: 'pose3 level',
            pose_type: 'pose3 type',
            img: 'image3',
            video: 'video3',
        },
        {
            id: 4,
            name_eng: 'test-pose 4',
            alias: 'alias4',
            name_san: 'san 4',
            benefits: 'pose4 benefits',
            pose_level: 'pose4 level',
            pose_type: 'pose4 type',
            img: 'image4',
            video: 'video4',
        }
    ];
}

function makeUsersArray() {
    return [
        {
            id: 1,
            fullname: 'user1 full name',
            username: 'userName1',
            password: '!112Aabcd',
        },
        {
            id: 2,
            fullname: 'user2 full name',
            username: 'userName2',
            password: '!122Aabcd',
        },
        {
            id: 3,
            fullname: 'user3 full name',
            username: 'userName3',
            password: '!1233Aabcd',
        },
    ];
}

function makeFlowsArray() {
    return [
        {
            id: 1,
            title: 'flow1',
            author: 1,

        },
        {
            id: 2,
            title: 'flow2',
            author: 2,
        },
        {
            id: 3,
            title: 'flow3',
            author: 1,
        }
    ];
}

function makeSectionFlowsArray() {
    return [
        {
            id: 1,
            section: 'warmUp',
        },

        {
            id: 2,
            section: 'midFlow',
        },

        {
            id: 3,
            section: 'peakPose',
        },

        {
            id: 4,
            section: 'breakPoses',
        },
        {
            id: 5,
            section: 'afterBreak',
        }
    ];
}

function makeFlowsPosesArray(flows, users, poses, sectionFlows) {
    return [
        {
            main_flow_id: 1,
            author: 1,
            pose_id: 1,
            section_flow_id: 1,
        },
        {
            main_flow_id: 1,
            author: 1,
            pose_id: 2,
            section_flow_id: 1,
        },
        {
            main_flow_id: 3,
            author: 1,
            pose_id: 1,
            section_flow_id: 2,
        },
        {
            main_flow_id: 1,
            author: 2,
            pose_id: 1,
            section_flow_id: 2,
        }
    ];
}

function makeNotesArray(flows, poses, users) {
    return [
        {
            id: 1,
            assigned_flow_id: 1,
            pose_id: 1,
            author: 1,
            notes: 'this is test note1'
        },
        {
            id: 2,
            assigned_flow_id: 1,
            pose_id: 2,
            author: 1,
            notes: 'this is test note2'
        },
        {
            id: 3,
            assigned_flow_id: 1,
            pose_id: 3,
            author: 1,
            notes: 'this is test note3'
        },
        {
            id: 4,
            assigned_flow_id: 1,
            pose_id: 4,
            author: 1,
            notes: 'this is test note4'
        }
    ];
}

function makePoseAttributesArray(users, flows, poses) {
    return [
        {
            author: 1,
            assigned_flow_id: 1,
            pose_id: 1,
            attribute: 'some attribute for pose1'
        },
        {
            author: 2,
            assigned_flow_id: 1,
            pose_id: 1,
            attribute: 'some attribute for pose1'
        },
        {
            author: 1,
            assigned_flow_id: 1,
            pose_id: 2,
            attribute: 'some attribute1 for pose2'
        },
        {
            author: 1,
            assigned_flow_id: 1,
            pose_id: 2,
            attribute: 'some attribute2 for pose2'
        }
    ];
}

function makeTestFixtures() {
    const testPoses = makePosesArray();
    const testUsers = makeUsersArray();
    const testFlows = makeFlowsArray();
    const testSectionFlows = makeSectionFlowsArray();
    const testFlowsPoses = makeFlowsPosesArray(testFlows, testUsers, testPoses, testSectionFlows);
    const testNotes = makeNotesArray(testFlows, testPoses, testUsers);
    const testPoseAttributes = makePoseAttributesArray();
    return { testPoses, testUsers, testFlows, testSectionFlows, testFlowsPoses, testNotes, testPoseAttributes };
}

function makeMaliciousPose() {
    const maliciousPose = {
        id: 911,
        name_eng: '<script>alert("xss");</script>',
        alias: '<script>alert("xss");</script>',
        name_san: '<script>alert("xss");</script>',
        benefits: '<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
        pose_level: '<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
        pose_type: '<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
        img: '<img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">',
        video: 'video1',
    };

    const expectedPose = {
        name_eng: '&lt;script&gt;alert("xss");&lt;/script&gt;',
        alias: '&lt;script&gt;alert("xss");&lt;/script&gt;',
        name_san: '&lt;script&gt;alert("xss");&lt;/script&gt;',
        benefits: '<img src="https://url.to.file.which/does-not.exist">',
        pose_level: '<img src="https://url.to.file.which/does-not.exist">',
        pose_type: '<img src="https://url.to.file.which/does-not.exist">',
        img: '<img src="https://url.to.file.which/does-not.exist">',
        video: 'video1',
    };

    return {
        maliciousPose,
        expectedPose,
    };
}

module.exports = {
    makePosesArray,
    makeUsersArray,
    makeFlowsArray,
    makeSectionFlowsArray,
    makeFlowsPosesArray,
    makeNotesArray,
    makePoseAttributesArray,
    makeTestFixtures,
    makeMaliciousPose,
    makeTestFixtures,
};