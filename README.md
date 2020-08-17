# DevConnector
A MERN social app to connect different developers with each other and share their profile with potentail employers.

This app allows a developer to create his profile, which features Bio detials along with Education and Experience details. Users can also share links to their social media
accounts. 

This app also boasts a Discussion Panel where users can write posts, comment on each other's posts and also upvote each other's posts. 

The user first needs to register for any functionality, though you may view developer's profiles without signing up.

## Edits
Deleted my configuration file. Create your own configuration file by navigating to the config directory in the root folder and inside the config directory create a 
default.json file with the following fields
- mongoURI: Your MongoDB url; use MongoDB Atlas for cloud or run Mongo locally.
- jwtSecret: JWT Secret
- githubClientId: Use your Github API generated ClientId here; used by this app to load a user's 5 latest git repositories(if any).
- githubClientSecret: Also generated by the Github API.

## Bugs
Currently, the discussion panel doesn't work as expected. Like and unlike functionality not working. Needs revision.
