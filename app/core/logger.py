import logging
import sys

from pythonjsonlogger.json import JsonFormatter


class PrefixedJsonFormatter(JsonFormatter):
    def format(self, record):
        json_log = super().format(record)
        return f"logger:{record.name} {json_log}"


formatter = PrefixedJsonFormatter("%(asctime)s %(levelname)s %(message)s")


def create_logger(logger_name: str):
    logger = logging.getLogger(logger_name)
    logger.setLevel(logging.INFO)
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    return logger


app_logger = create_logger("app")
api_logger = create_logger("api")
db_logger = create_logger("db")
auth_logger = create_logger("auth")
worker_logger = create_logger("redis_worker")
report_logger = create_logger("s3_report_worker")
