const mongoCollectionNamePattern = /^[A-Za-z0-9_-]+$/;

export function getSafeMongoCollectionName(configuredName: string | undefined, fallbackName: string) {
  if (!configuredName) {
    return fallbackName;
  }

  return mongoCollectionNamePattern.test(configuredName) ? configuredName : fallbackName;
}
