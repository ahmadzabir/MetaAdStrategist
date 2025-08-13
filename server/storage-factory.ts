import { IStorage } from './storage';
import { FirebaseStorage } from './services/firebase';

// Factory function to get the appropriate storage implementation
export function createStorage(): IStorage {
  // Use Firebase storage in production for scalability
  return new FirebaseStorage();
}

export const storage = createStorage();