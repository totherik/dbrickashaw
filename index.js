import caller from 'caller';
import Publisher from './lib/publisher';
import Logger from './lib/logger';


const PUBLISHER = new Publisher();

export default {

    getPublisher() {
        return PUBLISHER;
    },

    createLogger(name = caller()) {
        let logger = new Logger(name);
        this.getPublisher().observe(logger);
        return logger;
    }

};
