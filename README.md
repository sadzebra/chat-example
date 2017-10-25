# chat-example

Simple chat application using node and socket.io.

DB: This application uses a mongo DB the URL and credentials are currently in
the project and are using mlabs as a test platform.

Dependancies:
  - socket.io
  - express
  - easymongo
devDependancies:
  - nodemon

Install project
  - npm install

run project
  - npm start (this will load nodemon dev server)

Viewing:
  - localhost:3000

Features:
Basic functionality allows the user to create a chatroom, it allows other users
to join the chatroom if they use the link provided.

When a new user joins a chat they are given the previous chat history to keep
up to date with what's going on.

When login in the user can set a username so they can be itentified.

All Chat messages are stored on a posts database that stores the username thay
send the message, the message and the chat ID. To search a chat we can search
for the chatroom ID and they the search term (User or word in message).

The DB is MongoDB and is hosted on mlabs for easy of development.

Users are also stored.

Features not implemented:
One of the main features that was not implemented was blocking a user, this was
because of time constraints on my part. This would be a welcome feature for
future improvements of the app. My thoughts on implementing this would be to
add an 'X' or item next to the username, when this is clicked the user can
confirm they want to block this user, the user will then be blocked on the
database and be refused login next time.

Improvements:
A number of areas can be improved on this app, one major improvement would be
better handling of errors and failures. Error handling could be greatly improved
when handling socket connects and while retrieving data from databases.

Testing can also be added to the application. The application has only been
tested manually so far.
