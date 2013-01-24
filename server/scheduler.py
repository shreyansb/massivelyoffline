import logging
import resq
from pyres.scheduler import Scheduler

def start_scheduler():
    logging.info("Starting scheduler for %s" % resq._REDIS)
    try:
        Scheduler.run(resq._REDIS)
        logging.info("started scheduler...")
    except Exception, e:
        logging.error("error starting scheduler: %s" % e)

if __name__ == "__main__":
    start_scheduler()
