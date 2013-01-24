import argparse
import logging
import resq
from pyres.worker import Worker

parser = argparse.ArgumentParser(description='Run a ResQ worker')
parser.add_argument('-q', type=str, default='', required=False, dest='queues',
                    help='a comma separated list of queus for the worker to consume')
parser.add_argument('-a', type=int, default=0, required=False, dest='all',
                    help='if 1, will start a worker for all possible queues')
parser.add_argument('-i', type=int, default=1, required=False, dest='interval',
                    help='the interval between tasks, in seconds')

def start_worker(queues, all, interval):
    """ Start a worker process to consume the queues in :queues.
    :interval is the number of seconds before tasks. Minimum of 1 sadly.
    """
    selected_queues = map(str, queues)
    known_queues = resq.get_queue_names()
    unknown_queues = map(str, set(queues).difference(set(known_queues)))

    # gotta have at least one queue
    if not selected_queues:
        if all:
            selected_queues = known_queues
        else:
            message = "option --queues must be one or more of: %s. exiting." % known_queues
            logging.error(message)
            return

    # stop if one of the queues specified is not in the list of possible queues
    if unknown_queues:
        message = "received one or more unknown queue names: %s. exiting." % list(unknown_queues)
        logging.error(message)
        return

    logging.info("Starting worker for %s with interval of %s second(s), for %s" 
                % (selected_queues, interval, resq._REDIS))
    try:
        Worker.run(selected_queues, resq._REDIS, interval)
        logging.info("started worker...")
    except Exception, e:
        logging.error("error starting worker: %s. exiting." % e)


if __name__ == "__main__":
    args = parser.parse_args()
    interval = args.interval
    queues = args.queues
    all = True if args.all == 1 else False
    start_worker(queues, all, interval)
