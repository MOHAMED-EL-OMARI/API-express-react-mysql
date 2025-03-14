const bcrypt = require('bcrypt');

// The password you want to hash
const mypass = "12345";

// Set the number of salt rounds for bcrypt (10 is commonly used)
const saltRounds = 2;

async function hashPassword(password) {
    try {
        // Hash the password with bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password:', hashedPassword);
    } catch (error) {
        console.error('Error hashing password:', error);
    }
}

// Call the function with the password
hashPassword(mypass);