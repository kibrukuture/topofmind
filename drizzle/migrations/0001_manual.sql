
-- this was added manually for the first time.
CREATE SCHEMA IF NOT EXISTS "topofmind";

GRANT USAGE ON SCHEMA topofmind TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA topofmind TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA topofmind TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA topofmind TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA topofmind GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA topofmind GRANT ALL ON ROUTINES TO service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA topofmind GRANT ALL ON SEQUENCES TO service_role;

-- this is for the default random uuid. 
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA topofmind;


 
CREATE EXTENSION IF NOT EXISTS vector SCHEMA topofmind; 

