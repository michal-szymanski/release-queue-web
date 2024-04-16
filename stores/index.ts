import { DataStore } from '@/stores/data-store';
import { UiStore } from '@/stores/ui-store';

export class RootStore {
    public dataStore: DataStore;
    public uiStore: UiStore;

    constructor() {
        this.dataStore = new DataStore();
        this.uiStore = new UiStore(this.dataStore);
    }
}
