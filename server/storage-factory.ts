import { IStorage } from './storage';
import { FirebaseStorage } from './services/firebase';
import { HardcodedStorage } from './hardcoded-storage';

// Factory function to get the appropriate storage implementation
export function createStorage(): IStorage {
  // Use hardcoded storage with complete authentic Meta targeting categories
  return new HardcodedStorage();
}

export const storage = createStorage();