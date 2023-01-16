import { PublicKey, verify, SecretKey, Signature } from "@chainsafe/blst";

class BlsService {
  private SecretKey: SecretKey;
  private PublicKey: PublicKey;

  constructor() {
    // @todo: keygen source should be coming from .env
    this.SecretKey = SecretKey.fromKeygen(Buffer.alloc(32, 1));
    this.PublicKey = this.SecretKey.toPublicKey();
  }

  sign(msg: String): Uint8Array {
    const buffer = Buffer.from(msg);
    const sig = this.SecretKey.sign(buffer);
    return sig.toBytes();
  }

  verify(msg: String, sig: Buffer) {
    const msgBuffer = Buffer.from(msg);
    const signature = Signature.fromBytes(Buffer.from(sig));
    return verify(msgBuffer, this.PublicKey, signature);
  }
}

export default BlsService;