import SatoshiGameService from "./SatoshiGameService";
import { SuiService } from "./SuiService";

// using this export method to maintain a shared storage between .ts files
export default {
  // SuiService: new SuiService(),
  SatoshiGameService: new SatoshiGameService(),
};
