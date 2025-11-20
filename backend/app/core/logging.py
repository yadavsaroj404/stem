import logging
from logging.handlers import RotatingFileHandler
import sys
from pathlib import Path
from app.core.config import settings

def setup_logging():
    """Set up the application's logging."""
    log_dir = Path(settings.LOGS_DIR)
    log_dir.mkdir(exist_ok=True)
    log_file = log_dir / "app.log"

    # Create a logger
    logger = logging.getLogger("app")
    logger.setLevel(logging.INFO)

    # Create a rotating file handler
    # 10 MB per file, keep 5 backup files
    file_handler = RotatingFileHandler(log_file, maxBytes=10*1024*1024, backupCount=5)
    file_handler.setLevel(logging.INFO)

    # Create a console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # Create a formatter and set it for both handlers
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(module)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Add the handlers to the logger
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger

logger = setup_logging()
