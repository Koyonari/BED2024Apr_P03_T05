// Used to store configuration settings
module.exports = {
  db: {
      user: 'booksapi_user',
      password: '123',
      server: 'localhost',
      database: 'spooncular_pantry',
      trustServerCertificate: true,
      options: {
        port: 1433, // Default SQL Server port
        connectionTimeout: 60000, // Connection timeout in milliseconds
      }
  },
  SPOONACULAR_API_KEY: 'dfeee259ff5341e0ba251d1513120f8c'
};