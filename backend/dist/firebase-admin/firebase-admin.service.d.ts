import * as admin from 'firebase-admin';
export declare class FirebaseAdminService {
    private firebaseApp;
    constructor();
    verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken>;
    getUserByUid(uid: string): Promise<admin.auth.UserRecord>;
    createCustomToken(uid: string, additionalClaims?: object): Promise<string>;
    getApp(): admin.app.App;
}
