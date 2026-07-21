const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres.qmdqkekxuptqbkkbzsvl:abhishekjathanam@aws-0-eu-central-1.pooler.supabase.com:6543/postgres' });
client.connect()
  .then(() => client.query("SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime'"))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => client.end());
