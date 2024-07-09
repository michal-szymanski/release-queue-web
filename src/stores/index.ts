import { DataStore } from '@/stores/data-store';
import { UiStore } from '@/stores/ui-store';

class RootStore {
    public dataStore: DataStore;
    public uiStore: UiStore;

    constructor() {
        this.dataStore = new DataStore();
        this.uiStore = new UiStore(this.dataStore);
    }
}

export const rootStore = new RootStore();
