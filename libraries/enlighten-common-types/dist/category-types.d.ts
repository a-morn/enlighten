declare type CategoryId = 'game-of-thrones' | 'countries' | 'music-theory';
export declare type Category = {
    id: CategoryId;
    label: string;
    background: string;
    backgroundBase64: string;
};
declare function isCategoryId(x: string | CategoryId): x is CategoryId;
export { CategoryId, isCategoryId };
