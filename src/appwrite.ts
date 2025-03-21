import { Client } from 'appwrite';
import { appwriteEndpointURL, appwriteProjectID } from './secrets';

const Appwriteclient = new Client();

Appwriteclient.setProject(appwriteProjectID);
Appwriteclient.setEndpoint(appwriteEndpointURL);

export default Appwriteclient;
