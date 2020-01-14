module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DB_URL || 'postgresql://kamirska@localhost/yoga-app',
    JWT_SECRET: process.env.JWT_SECRET || 'yoga-nowysekret',
    CLIENT_ORIGIN: 'https://yoga-capstone.kasia2.now.sh'
}