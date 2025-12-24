import { Database} from "../../../index.js";

const database = new Database({
  subdomain: process.env.MONGO_SUBDOMAIN,
  username: process.env.MONGO_USERNAME,
  password: process.env.MONGO_PASSWORD,
  cluster: process.env.MONGO_CLUSTER,
  dbName: process.env.MONGO_DBNAME,
});

export default database;