export declare function toZn(a: number | bigint, n: number | bigint): bigint;
export interface Egcd {
    g: bigint;
    x: bigint;
    y: bigint;
}
export declare function eGcd(a: number | bigint, b: number | bigint): Egcd;
export declare function modInv(a: number | bigint, n: number | bigint): bigint;
export declare function abs(a: number | bigint): number | bigint;
export declare function modPow(b: number | bigint, e: number | bigint, n: number | bigint): bigint;
//# sourceMappingURL=bigint-mod-arith.d.ts.map