import { MongoClient } from "mongodb";

const uri = "mongodb://gradesUser:gradesPass@mongodb-grade-service:27017/grades?authSource=grades";


const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Conectado a Mongo sin autenticación");
    const db = client.db("grades");
    const collection = db.collection("notas");

    const result = await collection.insertOne({ estudiante: "Diego", nota: 5 });
    console.log("Insertado:", result.insertedId);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
