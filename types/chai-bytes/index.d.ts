/// <reference types="chai" />

declare module "chai-bytes" {
    function chaiBytes(chai: any, utils: any): void;
    
    export = chaiBytes;
}

declare namespace Chai {

    // For BDD API
    interface Assertion extends LanguageChains, NumericComparison, TypeComparison {
        equalBytes(expected: string | Array<number> | ArrayLike<number>): void;
    }

}