SPC_NAME_TO_ID_VOCAB = {
    'BigBrain (2015)': 'minds/core/referencespace/v1.0.0/a1655b99-82f1-420f-a3c2-fe80fd4c8588',
    'waxholm': 'minds/core/referencespace/v1.0.0/d5717c4a-0fa1-46e6-918c-b8003069ade8',
    'allen': 'minds/core/referencespace/v1.0.0/265d32a0-3d84-40a5-926f-bf89f68212b9',
}

class KG_IDS:

    BIGBRAIN_CCSV_ID = "53eaaffd-b77b-4c62-b660-09231b32d0c6"
    ALLEN_CCSV_ID = "ebd6cd8a-7d30-43f4-a035-4485cd91e52e"
    WAXHOLM_CCSV_ID = "a591407e-7b10-4c3a-b9e4-d089cff56532"

    VOLUBA_TRANSFORM_FILE_FORMAT_ID = "caeef910-8691-4e88-83a0-726ea844c2d9"
    VOLUBA_WEBSERVICE_VERSION_ID = "e6d90b6f-645d-4782-818b-f2250a66ea89"


SPC_NAME_TO_KG_ID = {
    'BigBrain (2015)': KG_IDS.BIGBRAIN_CCSV_ID,
    'waxholm': KG_IDS.WAXHOLM_CCSV_ID,
    'allen': KG_IDS.ALLEN_CCSV_ID,
}

class KG_INSTANCES:
    transform_format=None
    voluba_webservice_version=None
    
    bigbrain=None
    allen_ccf=None
    waxholm=None

class STRING_CONST:
    UploadToDPName="Upload to dataproxy"
    CreateKgTransformFileInstName="Create Transform File Instance"
    CreateKgIncVolFileInstName="Create Incoming Volume File Instance"
    CreateKGDAName="Create Data Analysis"
    DeleteKGInst="Delete KG instances"
