import { createStorageItem } from '../../utils/storage.utils.ts';

const showMyRecordsStorageItem = createStorageItem<boolean>('showMyRecords');

export default showMyRecordsStorageItem;
