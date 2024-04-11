import { Client, Account, Databases, } from 'appwrite';

export const appWriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    url: import.meta.env.VITE_APPWRITE_URL|| '',
    databasesId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    tripDataCollectionId: import.meta.env.VITE_APPWRITE_TRIP_INFO_COLLECTION_ID,
 
}

export const client = new Client()
client.setProject(appWriteConfig.projectId)
client.setEndpoint(appWriteConfig.url)
export const account = new Account(client)
export const databases = new Databases(client)