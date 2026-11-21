import { Client, Databases, Storage, Users } from 'node-appwrite';
import { infraConfig } from '@/config/infrastructure';

export function getAppwriteServerClient() {
  const config = infraConfig.getAppwriteConfig();

  if (!config.isConfigured || !config.apiKey) {
    return null;
  }

  const client = new Client();
  client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setKey(config.apiKey);

  return {
    client,
    databases: new Databases(client),
    storage: new Storage(client),
    users: new Users(client),
    databaseId: config.databaseId,
    bucketId: config.bucketId,
  };
}
