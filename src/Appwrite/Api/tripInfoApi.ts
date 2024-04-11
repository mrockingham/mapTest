import { ID, Query } from 'appwrite';
import { account, appWriteConfig, databases } from '../config';


export const createTripInfo = async (tripInfo: any) => {
    console.log('trip info', tripInfo)

    const data ={
        route: [tripInfo.route],
        tripName: tripInfo.tripName
    }
    try {
        const create = await databases.createDocument(
            appWriteConfig.databasesId || '',
            appWriteConfig.tripDataCollectionId|| '',
            ID.unique(),
            data
        );

        return create;
    } catch (err: any) {
        throw new Error(err);
    }
};

export const getSingleTripInfo = async (id: string) => {
    console.log('get id', appWriteConfig.databasesId)
    try {
        const getTrip = await databases.getDocument(
            appWriteConfig.databasesId,
            appWriteConfig.tripDataCollectionId,
            id
        );

        return getTrip;
    } catch (err: any) {
       console.log('api error', err)
    }
};