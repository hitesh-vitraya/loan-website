import { getMongoCollection } from "./mongodb";
import { getSafeMongoCollectionName } from "./mongo-collection-name";

export type UsZipLookupResult = {
  city: string;
  state: string;
};

type ZipRow = {
  zip: string;
  city: string;
  state: string;
  country?: string;
};

const configuredZipCollectionName = process.env.MONGODB_ZIP_COLLECTION ?? "us_zip_lookup";
const zipCollectionName = getSafeMongoCollectionName(configuredZipCollectionName, "us_zip_lookup");

export async function lookupUsZip(zip: string): Promise<UsZipLookupResult | null> {
  const collection = await getMongoCollection<ZipRow>(zipCollectionName);

  const location = await collection.findOne(
    {
      zip,
      country: "United States"
    },
    {
      projection: {
        city: 1,
        state: 1
      }
    }
  );

  if (!location?.city || !location?.state) {
    return null;
  }

  return {
    city: String(location.city).trim(),
    state: String(location.state).trim()
  };
}
