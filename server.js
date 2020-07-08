const express = require('express');
const app = express();
const port = 3000;
var cors = require('cors');
var knex = require('knex')({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'drew',
        password: '1987',
        database: 'smart-brain'
    }
});
const bcrypt = require('bcrypt');


app.use(cors())
app.use(express.json());

const database = {
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Drew',
            email: 'drew@gmail.com',
            password: '1987',
            entries: 12,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {
    res.json(database.users)
})

app.post('/signin', (req, res) => {
    const { email, password } = req.body;
    let hash = '';
    knex.select('*').from('login').where('email', email).then(data => {
        hash = data[0].hash;
        bcrypt.compare(password, hash, function (err, result) {
            if (result) {
                knex.select('*').from('users').where('email', data[0].email).then(response => {
                    res.json(response[0]);
                })
            } else {
                res.status(400).json('failed login');
            }
        });
    });
})

app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, function (err, hash) {
        knex('login').insert({
            email: email,
            hash: hash
        }).then();
    });

    knex('users').returning('*').insert({
        email: email,
        name: name,
        joined: new Date()
    }).then(user => {
        res.json(user[0]);
    })
})

app.get('/profile/:id', (req, res) => {
    const { id } = req.params;
    let found = false;
    database.users.forEach(user => {
        if (user.id === id) {
            found = true;
            return res.json(user);
        }
    })
    if (!found) {
        res.status(400).json("User not found.");
    }
})

app.put('/image', (req, res) => {
    const { email } = req.body;
    knex('users')
        .where('email', '=', email)
        .increment('entries', 1)
        .returning('entries')
        .then(data => {
            res.json({entries: data[0]})
        });
})

app.listen(port)

/*

/ --> res = this is working
/signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user

*/