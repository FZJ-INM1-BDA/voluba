import time

class VolubaStore:
    """
    Simple implementation of long term store.
    Currently, the storage is in memory. 
    TODO: expiration based on created_time
    TODO: add persistence (write to disk/db)
    """
    def __init__(self):
        self._dict={}
    
    def set_value(self, key: str, value):
        self._dict[key] = {
            'created_time': time.time(),
            'data': value
        }
    
    def get_value(self, key: str):
        if key in self._dict:
            return self._dict[key].get("data")
        return None
    
    def delete_value(self, key: str):
        self._dict.pop(key, None)
