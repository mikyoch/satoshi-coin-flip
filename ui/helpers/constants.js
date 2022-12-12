export const COIN = {HEADS: 1, TAILS: 0};
//FIXME: Either find a way to get client-side env variables on k8s or make an api call to get this value
export const PACKAGE = process.env.NEXT_PUBLIC_PACKAGE || "0x2c30624c372b0094d4c37ebaf0f246284268c23e";