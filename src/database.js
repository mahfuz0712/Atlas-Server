import mongoose from "mongoose";


export class Database {
  constructor(config) {
    this.config = config;
  }
  async connect() {
    if (!this.config) {
      console.log("Please provide the database configuration");
      return false;
    }
    const { subdomain, username, password, cluster, dbName } = this.config;
    // Primary +srv URL
    const srvURL = `mongodb+srv://${username}:${password}@${cluster.toLowerCase()}.${subdomain}.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=${cluster.toLowerCase()}`;
    // Fallback standard mongodb:// URL (you need to adjust hostnames from Atlas)
    const fallbackURL = `mongodb://${username}:${password}@${cluster.toLowerCase()}-shard-00-00.${subdomain}.mongodb.net:27017,${cluster.toLowerCase()}-shard-00-01.${subdomain}.mongodb.net:27017,${cluster.toLowerCase()}-shard-00-02.${subdomain}.mongodb.net:27017/${dbName}?ssl=true&replicaSet=atlas-0&authSource=admin&retryWrites=true&w=majority`;
    try {
      console.log("Trying primary +srv connection...");
      await mongoose.connect(srvURL);
      console.log("Connected to MongoDB Atlas via +srv URL");
      return true;
    } catch (err) {
      console.warn("+srv connection failed:", err.message);
      console.log("Trying fallback standard connection...");

      try {
        await mongoose.connect(fallbackURL);
        console.log("Connected to MongoDB Atlas via fallback URL");
        return true;
      } catch (fallbackErr) {
        console.error("Fallback connection failed:", fallbackErr.message);
        return false;
      }
    }
  }
}




export function Model(modelName, schemaDefinition, options = {}) {
  const { middleware, ...restOptions } = options;

  const schema = new mongoose.Schema(schemaDefinition, {
    timestamps: true,
    versionKey: false,
    ...restOptions,
  });

  // Allow user to add pre/post middleware
  if (typeof middleware === "function") {
    middleware(schema);
  }

  const model =
    mongoose.models[modelName] || mongoose.model(modelName, schema);

  // Return the object directly, no need to call a function
  return {
    create: async (data) => model.create(data),
    findAll: async (filters = {}) => model.find(filters),
    findById: async (id) => model.findById(id),
    updateById: async (id, data) => model.findByIdAndUpdate(id, data, { new: true }),
    deleteById: async (id) => model.findByIdAndDelete(id),
    raw: model, // expose raw mongoose model
  };
}

