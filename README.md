# terminordle

> multiplayer [wordle](https://www.powerlanguage.co.uk/wordle/) clone in your terminal

![screenshot of local terminordle single player](./src/util/data/terminordle.png)

terminordle (pronounced "terminalordle") is inspired by the popular online game [wordle](https://www.powerlanguage.co.uk/wordle/) made for your terminal. You can play a pretty close replica of the original locally or multiplayer over the network.

## install

```
git clone https://github.com/HP4k1h5/terminordle.git
cd terminordle
yarn # or npm i
```

## play

### local single player

from the `terminordle` directory

```
yarn play
```

### remote multiplayer

To start or join a multiplayer session you must know the address of a running terminordle server. See [serve](#serve). I currently have one running at 174.138.46.61:8080. If the server is up and not overloaded, you can use it for your multiplayer sessions, or you can host your own.

The key command is `join`.

### new session

To start a new session include only the address of the server

``` bash
yarn join 174.138.46.61:8080
# If that server is overloaded try again later.
```

The server should respond with your user id and session name. These are both randomly chosen and cannot be changed. They are ephemeral.

> example response

```bash
welcome to terminordle
session id: session-name
user id: Yong
>>                      <<
abcdefghijklmnopqrstuvwxyz

```

The user id is chosen from the top one thousand most common names on Earth. The server-name is composed of two words chosen randomly from the word list. Share it with your friends and they can use it as [below](#join-session)

### join session

If you know the two-word name of a session, you can use a command like the following to join that session, replacing "session-name" with the actual name of the session you wish you join. Someone will have to share this with you, or you will have to run the above command to generate a valid session id, and then share that with your friends.

```
yarn join 174.138.46.61:8080 -s session-name
```

### serve

Host your own terminordle server.

```
yarn serve
```

## gameplay

Standard wordle rules apply (mostly, submit an issue if there are discrepancies).

The session is terminated on win to free up server space. Play again if there is capacity.
