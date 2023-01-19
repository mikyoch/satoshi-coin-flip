const bls = require('@noble/bls12-381');

class BlsService {
  private SecretKey: any;
  private PublicKey: any;

  constructor() {
    // @todo: keygen source should be coming from .env
    this.SecretKey = '67d53f170b908cabb9eb326c3c337762d59289a8fec79f7bc9254b584b73265c';
    this.PublicKey =  bls.getPublicKey(this.SecretKey);
  }

  async sign(msg: String): Promise<Uint8Array> {
    // const buffer = Buffer.from(msg);
    const sig = await bls.sign(msg, this.SecretKey);
    return sig;
  }

  async verify(msg: string, sig: Buffer) {
    const isValid = await bls.verify(Uint8Array.from(sig), msg, this.PublicKey);
    return isValid;
  }
}

export default BlsService;