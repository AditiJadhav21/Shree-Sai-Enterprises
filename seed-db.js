const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSeed() {
  console.log('Connecting to MySQL Server to initialize database & seed data...');

  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT, 10) || 3306;
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'shree_sai_enterprises';

  let connection;
  try {
    // Connect without specifying database first to allow creating it if needed
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true
    });

    console.log(`Connected to MySQL at ${host}:${port}`);

    // Read and run schema.sql
    const schemaFile = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaFile)) {
      console.log('Applying schema.sql...');
      const schemaSql = fs.readFileSync(schemaFile, 'utf8');
      await connection.query(schemaSql);
      console.log('✓ Schema applied successfully.');
    }

    // Switch to database
    await connection.query(`USE \`${database}\`;`);

    // Read and run seed.sql
    const seedFile = path.join(__dirname, '..', 'seed.sql');
    if (fs.existsSync(seedFile)) {
      console.log('Applying seed.sql...');
      const seedSql = fs.readFileSync(seedFile, 'utf8');
      await connection.query(seedSql);
      console.log('✓ Seed data populated successfully.');
    }

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Database seed error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

runSeed();
