import firebaseKey from "@conf/firebase.json";

import { getDatabase, type Database, type DatabaseReference, ref, onValue, DataSnapshot } from "firebase/database";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth, type User, signInAnonymously, onAuthStateChanged } from "firebase/auth";

export class Firebase {
    private static online: boolean = false;
    private static serverStateRef: DatabaseReference;
    private static serverLogRef: DatabaseReference;

    private static onConnectCb: () => void;
    private static onDisconnectCb: () => void;

    private constructor() {};
    
    public static async Initizalize(): Promise<void> {
        const app: FirebaseApp = initializeApp(firebaseKey);
        const auth: Auth = getAuth();
        const database: Database = getDatabase();

        await signInAnonymously(auth);
        
        onAuthStateChanged(auth, (user: User | null) => {
            if (!user) return;

            this.serverStateRef = ref(database, `server-state/mcms10`);
            this.serverLogRef = ref(database, `server-log`);
            
            setTimeout(() => {
                const connectedRef = ref(database, ".info/connected");
                onValue(connectedRef, (snap: DataSnapshot) => {
                    if (!snap.val()) {
                        this.online = false;
                        this.onDisconnectCb();
                    } else {
                        this.online = true;
                        this.onConnectCb();
                    }
                });
            }, 3000);
        });
    }

    public static IsOnline(): boolean {
        return this.online;
    }

    public static OnConnect(cb: () => void): void {
        this.onConnectCb = cb;
    }

    public static OnDisonnect(cb: () => void): void {
        this.onDisconnectCb = cb;
    }

    public static get SERVER_LOG_REF(): DatabaseReference {
        return this.serverLogRef;
    }

    public static get SERVER_STATE_REF(): DatabaseReference {
        return this.serverStateRef;
    }
}