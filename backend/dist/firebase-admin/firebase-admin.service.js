"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAdminService = void 0;
const common_1 = require("@nestjs/common");
const admin = require("firebase-admin");
let FirebaseAdminService = class FirebaseAdminService {
    constructor() {
        if (!admin.apps.length) {
            try {
                this.firebaseApp = admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                });
            }
            catch (error) {
                console.error('Firebase admin initialization error:', error);
            }
        }
        else {
            this.firebaseApp = admin.apps[0];
        }
    }
    async verifyIdToken(idToken) {
        try {
            return await this.firebaseApp.auth().verifyIdToken(idToken);
        }
        catch (error) {
            console.error('Error verifying auth token:', error);
            throw error;
        }
    }
    async getUserByUid(uid) {
        try {
            return await this.firebaseApp.auth().getUser(uid);
        }
        catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    }
    async createCustomToken(uid, additionalClaims) {
        try {
            return await this.firebaseApp.auth().createCustomToken(uid, additionalClaims);
        }
        catch (error) {
            console.error('Error creating custom token:', error);
            throw error;
        }
    }
    getApp() {
        return this.firebaseApp;
    }
};
exports.FirebaseAdminService = FirebaseAdminService;
exports.FirebaseAdminService = FirebaseAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FirebaseAdminService);
//# sourceMappingURL=firebase-admin.service.js.map