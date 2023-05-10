from logging import Logger, StreamHandler, INFO
from logging.handlers import TimedRotatingFileHandler
from voluba_config import LOG_DIR, LOG_LEVEL
from pathlib import Path

logger = Logger(__name__)

if LOG_DIR:
    import socket
    filename = Path(LOG_DIR) / f"{socket.gethostname()}.access.log"
    log_handler = TimedRotatingFileHandler(filename, when="d", encoding="utf-8")
else:
    log_handler = StreamHandler()

log_handler.setLevel(LOG_LEVEL)
logger.addHandler(log_handler)
