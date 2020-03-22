# Yogi Track 

Check it out at [yogi-track](https://yoga-capstone.now.sh/).

Yogi Track is a Full-Stack mobile first responsive web application for yoga teachers and enthusiasts helping a user to explore and learn avariety of poses, providing an english and sanskrit name for each pose with alphabetic sort based on either. The user can then create an account where he/she can save poses into yoga-flows as inspirations for a class or record of personal practice with notes and personal rating system.

## WHY MAKE THIS APP?
As a yoga teacher I find myself constatly googling the correct asana's names in sanskrit (there is way over 200 poses in yoga and to learn their complex sanskrit names takes time) and making lists of poses as part of my preperation before teaching a class. This app is meant to be a tool to help memorize sanskrit names, streamline class planning process and help teachers advance their skills.


|<img src='https://images-for-portfolio.s3.us-east-2.amazonaws.com/yoga+cap/home.png' width ='200' > | <img src='https://images-for-portfolio.s3.us-east-2.amazonaws.com/yoga+cap/flow-pick.png' width ='200' > | <img src='https://images-for-portfolio.s3.us-east-2.amazonaws.com/yoga+cap/flow-pose.png' width='200' > | <img src='https://images-for-portfolio.s3.us-east-2.amazonaws.com/yoga+cap/pose-card2.png' width='200' > |

## ENDPOINTS AND EXPECTED DATA
### User Registration
#### /api/register

  description: registration endpoint

  method: POST

  input: {

    body: {

      fullname: string,
      username: string,
      password: string,
      id: number

    }

  }


  output: {

    status: 201,

    body: {

      fullname: string,
      username: string,
      password: encrypted, 

    }

  }

### Auth Login Endpoint
#### /api/login

  description: user login endpoint
  
  method: POST

  input: {

    body: {

      userName: string, 
      password: string

    }


  output: {

    body: {

      authToken: jwt (javascript web token)

    }

  }

### POSES - Yoga Poses Endpoints
#### /api/poses

  description: get all yoga poses in DB

  method: GET

  output: {
    
    status: 200,

    body: [

      {
        id: number,
        img: image url,
        name_eng: pose name in english,
        name_san: pose name in sanskrit
        pose_level: level of pose,
        pose_type: body position when in pose
        benefits: benefits pose is known for,
      }

    ]

  }

#### /api/flow/:pose_id

  description: gets pose object

  method: GET

  params: pose_id = number

  output: {

    status: 200,

    body: {

        id: number,
        img: image url,
        name_eng: pose name in english,
        name_san: pose name in sanskrit
        pose_level: level of pose,
        pose_type: body position when in pose
        benefits: benefits pose is known for,
        
    }

  }

#### /api/flow/:flow_id/:pose_id

  description: gets pose from user flow

  method: GET

  params: /flow_id /pose_id
  
  output: {
    
    status: 200,

    body: {

      id: number,
      img: image url,
      alias: alias name of pose,
      name_eng: pose name in english,
      name_san: pose name in sanskrit,
      pose_level: level of pose,
      pose_type: boy position when in pose,
      video: video url for page,
      benefits: physical benefits resulting from pose

    }

  }

#### /api/flowatt/:pose_id

  description: takes attributes chosen for yoga pose and saves to db

  method: POST

  input: {
    body: [

      {
        
        pose_id: number, 
        assigned_flow_id: number,
        attribute: [
          
          string - attribute

        ]
      }
    ]
  }

  output: {

    status: 201,

    body: [

      {

        author: number,
        assigned_flow_id: number,
        pose_id: number, 
        attribute: string of attribute name
      }

    ]

  }

#### /api/flownote/:pose_id

  description: takes notes written about yoga pose and saves to db

  method: POST
  
  input: {

    body: {

      pose_id: number of pose,
      assigned_flow_id: number,
      notes: string - notes to save in db about pose,
      
    }

  }

  output: {

    status: 201,
    
    body: {

      assigned_flow_id: number
      author: number
      id: number
      notes: note saved to db
      pose_id: number

    }

  }

### FLOWS - Yoga Flows Endpoints
#### /api/flows

  description: gets all user flows in database

  method: GET

  output: {

    body: [
      status: 200,

      {

        id: number,
        title: string,
        author: number

      }

    ]

  }
  
#### /api/flows

  description: returns flow object

  method: POST

  input: {

    body: {

      afterPeak [],
      assignedPoses: [],
      author: number,
      breakPoses: [],
      id: number,
      midFlow: [],
      peakPose: [],
      title: string,
      warmUp: []

      },

    }

  }

  output: {
    
    status: 201,

    body: {
      
      afterPeak [],
      assignedPoses: [],
      author: number,
      breakPoses: [],
      id: number,
      midFlow: [],
      peakPose: [],
      title: string,
      warmUp: []

    }
  }

#### /api/flow-pose

  description: add pose into flow

  method: POST

  input: {

    user: {

      id: number

    },

    body: {

      main_flow_id: number,
      pose_id: number,
      section_flow_id: number

    }

  }

  output: {

    status: 201,

    body: {

      author: number
      main_flow_id: number,
      pose_id: number,
      section_flow_id: number

    }
  }

#### /api/flows/:flow_id

  description: get flow object

  method: GET

  params: flow_id (id of flow to get from db)

  output: {

    status: 200,

    body: {

      flow: flow object

    }

  }

#### /api/delete/:flow_id/:pose_id

  description: delete pose from flow

  method: DELETE

  params: flow_id, pose_id

  output: {

    status: 204,
    message: 'pose deleted from flow'

  }


## TECH STACK
#### FRONT-END
* HTML5
* CSS3
* JavaScript
* React.js front end framework
* font-awesome

#### BACK-END
* Node.js backend run-time environment
* Express.js backend framework and architecture
* SQL for database
* Postgres - relational database management system
* JWTs for authentication

#### TESTING and DEPOLYMENT
* Mocha - back-end testing framework
* Chai - assertion library backend testing
* Enzyme - React.js testing utility
* Zeit - cloud platform for static sites
* Heroku - cloud application platform

## FUTURE IMPROVEMENTS

### UI IMPROVEMENTS
* significatly bigger poses library
* way to narrow poses display by anatomy, level of dificulty and saved attributes like 'energizing poses'
* search bar for certain pose by name or anatomy

### UX IMPROVEMENTS
* drag&drop functionality to edit a flow
* abitlity to share flows between users or to social media
* option to see all ever saved poses with their personal attributes and comments

### OTHER FRONT-END IMPROVEMENTS
* Google and facebook login
* Full scale React unit testing

### SERVER-SIDE IMPROVEMENTS
* login timeout
* edit/update endpoints for flows and cards
