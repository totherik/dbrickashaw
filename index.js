import caller from 'caller';
import Relay from './lib/relay';
import Logger from './lib/logger';


const RELAY = new Relay();

export default {

    getRelay() {
        return RELAY;
    },

    createLogger(name = caller()) {
        let logger = new Logger(name);
        this.getRelay().observe(logger);
        return logger;
    }

};
