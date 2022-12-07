export const COIN = {HEADS: 1, TAILS: 0};
//FIXME: Either find a way to get client-side env variables on k8s or make an api call to get this value
export const PACKAGE = process.env.NEXT_PUBLIC_PACKAGE || "0x3562a098ae75768b76d93cf74c543456ba797070";