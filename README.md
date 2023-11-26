# Ilearn-backend

A Nodejs based backend system  using MongoDB,NodeJS,Express,Mongoose, and deployed on aws.
With Both a Flutter Based App and a ReactJS Website as Frontend:-
- [ReactJS Website](https://github.com/abhinandnn/udemy-clone-frontend)
- [Flutter Application](https://github.com/Pudv95/iLearn)

## FEATURES

- NodeJS as a web framework for the backend
- Mongodb as the database
- Deployed on aws
- Cart service
- Wishlist
- Video Streaming
- Video resolution in 144p,360p and 720p
- Rating system for the courses.
- Wallet feature.
- Payment portal using razorpay.
- JWT Authentication for secure API access.

## RUNNING THE SERVER


1. Clone the repository:

```CMD
git clone https://github.com/AVtheking/Ilearn-backend
```
To run the server, you need to have NodeJS installed on your machine. If you don't have it installed, you can follow the instructions [here](https://nodejs.org/en//) to install it.



2. Install the dependencies: 

```CMD
npm install
```


4. Setup .env file in base directory:

```
    PORT=
    DB=" "
    EMAIL=" "
    PASS=" "
    USER=" "
    RESET=" "
    KEY_ID=" "
    KEY_SECRET=" "
    FFMPEG_PATH=" "
    FFPROBE_PATH=" "

```


5. Run the backend server on localhost:

```CMD
npm start
```


You can access the endpoints from your web browser following this url
```url
http://127.0.0.1:PORT
```
## 🛣Roadmap Project 



- [ ] *Task 1: Implement Google OAuth*
  - Integrate Google OAuth for a seamless and secure login experience.
  - Allow users to sign in with their Google accounts.
  - Enhance user authentication and access control.

- [ ] *Task 2: Group Chat Feature*
  - Enable users to discuss doubts in real-time.

- [ ] *Task 3: Live Streaming*
  - Implement a live streaming feature enabling teacher to live stream their courses.
  - It would be able to handle good amount of use in a stream

- [ ] *Task 4: Bug Fixes and Optimization*
  - Address reported bugs and issues.
  - Optimize the performance of the application.
  - Conduct thorough testing to e



