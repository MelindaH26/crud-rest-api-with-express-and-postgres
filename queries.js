const { response } = require('express');
// Set up a Pool for Postgres DB queries (in a production environment this would be in a file with restricive permissions)
const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'me',
    host: 'localhost',
    database: 'test_api',
    password: 'password',
    port: 5432
});

// Get all users
const getUsers = (req, res) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

// Get a single user by ID
const getUserById = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).json(results.rows);
    });
};

// Post a new user
const createUser = (req, res) => {
    const { name, email } = req.body
  
    pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id', [name, email], (error, results) => {
        if (error) {
            throw error;
        } else if (!Array.isArray(results.rows) || results.rows.length < 1) {
    	    throw error;
        }
      res.status(201).send(`User added with ID: ${results.rows[0].id}`)
    })
  }

// Update and existsing user
const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    const {name, email} = req.body;

    pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            if (typeof results.rows == 'undefined') {
                res.status(404).send(`Resource not found`);
            } else if (Array.isArray(results.rows) && results.rows.length < 1) {
                res.status(404).send(`User not found`);
            } else {
                res.status(200).send(`User modified with ID: ${results.rows[0].id}`)         	
            }
        }
    );
}

// Delete a single user
const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        res.status(200).send(`The user with an id of ${id} was deleted`);
    });
}

// Exoirt CRUD functions
module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};