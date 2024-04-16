import { DataStore } from '@/stores/data-store';
import { action, computed, makeObservable, observable } from 'mobx';

export class UiStore {
    private _dataStore: DataStore;
    private _activeRepository: string | null = null;

    constructor(dataStore: DataStore) {
        type PrivateMembers = '_activeRepository';

        makeObservable<UiStore, PrivateMembers>(this, {
            _activeRepository: observable,
            setActiveRepository: action,
            activeRepository: computed,
            queueTabKeys: computed
        });

        this._dataStore = dataStore;
        this.setActiveRepository = this.setActiveRepository.bind(this);
    }

    public setActiveRepository(repository: string) {
        this._activeRepository = repository;
    }

    get activeRepository() {
        if (!this.queueTabKeys.length) {
            return null;
        }

        const firstRepository = this.queueTabKeys[0];

        if (!this._activeRepository || !this._dataStore.queueMap.get(this._activeRepository)) {
            return firstRepository;
        }

        return this._activeRepository;
    }

    get queueTabKeys() {
        return Array.from(this._dataStore.queueMap.keys());
    }
}
