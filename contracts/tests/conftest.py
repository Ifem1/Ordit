"""Windows compatibility for gltest direct mode's temporary stdin transport."""

import os

_unlink = os.unlink


def _unlink_when_released(path):
    try:
        _unlink(path)
    except PermissionError:
        # Windows keeps the duplicated stdin handle open until the direct VM
        # test completes; the OS cleans this temporary file afterwards.
        pass


os.unlink = _unlink_when_released
