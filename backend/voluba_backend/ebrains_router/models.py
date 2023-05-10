from typing import Union, List, Optional, Callable
from enum import Enum
from pydantic import BaseModel, Field
from tempfile import NamedTemporaryFile
import os
from ebrains_drive import BucketApiClient
from fairgraph import KGClient, IRI
from fairgraph.openminds.core import ContentType, File, WebServiceVersion, Hash
from fairgraph.openminds.sands import CommonCoordinateSpaceVersion
from fairgraph.openminds.computation import LocalFile, DataAnalysis
import json
from hashlib import md5
from datetime import datetime
import requests

from voluba_auth import S2SToken
from .const import SPC_NAME_TO_ID_VOCAB, KG_INSTANCES, KG_IDS, SPC_NAME_TO_KG_ID, STRING_CONST
from logger import logger


DP_BUCKET_NAME = 'spatial-anchoring'
KG_SPACE_NAME = "collab-spatial-anchoring"
DP_ROOT = 'https://data-proxy.ebrains.eu'
KG_ROOT = 'core.kg.ebrains.eu'

class WorkflowV1_1(BaseModel):
    incoming_volume: str = Field(..., alias="incomingVolume")
    content_hash: Optional[str] = Field(None, alias="contentHash")
    reference_volume: str = Field(..., alias="referenceVolume")
    version: Union[int, float, str]
    _type:str = Field(..., alias="@type")
    transform_matrix_in_nm: List[List[float]] = Field(..., alias="transformMatrixInNm")

class StartWorkflowResp(BaseModel):
    job_id: str

class JobProgressEnum(Enum):
    PENDING="PENDING"
    RUNNING="RUNNING"
    COMPLETED="COMPLETED"
    ERROR="ERROR"

class JobProgressModel(BaseModel):
    name: str
    status: JobProgressEnum=JobProgressEnum.PENDING
    detail: str=None

    def run(self, context:'WorkProgress'):
        logger.debug(f"Running {self.name}")
        self.status = JobProgressEnum.RUNNING
        self._run(context)
        logger.debug(f"Running {self.name} completed!")
        self.status = JobProgressEnum.COMPLETED

    def _run(self, context: 'WorkProgress'):
        raise NotImplementedError

class UploadToDP(JobProgressModel):
    name=STRING_CONST.UploadToDPName
    
    def _run(self, context: 'WorkProgress'):
        auth_token = S2SToken.get_token()
        client = BucketApiClient(token=auth_token)
        bucket = client.buckets.get_bucket(DP_BUCKET_NAME)
        
        assert context.param.reference_volume in SPC_NAME_TO_ID_VOCAB, f"Expecting reference volume name {context.param.reference_volume} is in {', '.join(SPC_NAME_TO_ID_VOCAB.keys())}, but is not."
        sanitized_spc_id = SPC_NAME_TO_ID_VOCAB[context.param.reference_volume].replace("/", ".")
        incoming_vol_id = context.param.content_hash or f'name.{context.param.incoming_volume}'
        bucket_filename = f"{sanitized_spc_id}_{incoming_vol_id}_transform_{context.param.version}.json"

        # Unfortunately, bucket API does not yet support stringIO, and must write it to disk first.
        with NamedTemporaryFile("w", suffix=".json", encoding="utf-8", delete=False) as fp:
            result = json.dumps(context.param.dict(by_alias=True), indent="\t")
            context.output_hash = md5(result.encode("utf-8")).hexdigest()
            fp.write(result)
            fp.write("\n")
        bucket.upload(fp.name, bucket_filename)
        os.unlink(fp.name)
        self.detail = f'{DP_ROOT}/v1/buckets/{DP_BUCKET_NAME}/{bucket_filename}'

class CreateKgTransformFileInstance(JobProgressModel):
    name=STRING_CONST.CreateKgTransformFileInstName

    def _run(self, context: 'WorkProgress'):

        auth_token = S2SToken.get_token()
        
        upload_stage = context.get_ooo(lambda proc: proc.name == STRING_CONST.UploadToDPName)
        assert upload_stage.status == JobProgressEnum.COMPLETED, f"Expecting upload file to have completed, but it is {upload_stage.status}"
        assert context.output_hash, f"Expecting output_hash to be populated by previous job(s), but was not."
        kg_client = KGClient(auth_token, host=KG_ROOT)

        if KG_INSTANCES.transform_format is None:
            KG_INSTANCES.transform_format = ContentType.from_id(KG_IDS.VOLUBA_TRANSFORM_FILE_FORMAT_ID, client=kg_client, scope="any")
        
        file_instance = File(
            name=upload_stage.detail,
            iri=IRI(upload_stage.detail),
            hash=[
                Hash(algorithm="md5", digest=context.output_hash)
            ],
            format=KG_INSTANCES.transform_format,
        )
        
        file_instance.save(kg_client, KG_SPACE_NAME)
        self.detail = file_instance.id

class CreateKgIncVolFileInstance(JobProgressModel):
    name=STRING_CONST.CreateKgIncVolFileInstName

    def _run(self, context: 'WorkProgress'):
        
        auth_token = S2SToken.get_token()
        kg_client = KGClient(auth_token, host=KG_ROOT)
        incoming_volume = LocalFile(
            name=context.param.incoming_volume,
            hash=context.param.content_hash,
            path=context.param.incoming_volume
        )
        incoming_volume.save(kg_client, KG_SPACE_NAME)
        self.detail = incoming_volume.id

class CreateKgDataAnalysisInstance(JobProgressModel):
    name=STRING_CONST.CreateKGDAName

    def _run(self, context: 'WorkProgress'):
        auth_token = S2SToken.get_token()
        kg_client = KGClient(auth_token, host=KG_ROOT)
        if KG_INSTANCES.voluba_webservice_version is None:
            KG_INSTANCES.voluba_webservice_version = WebServiceVersion.from_id(KG_IDS.VOLUBA_WEBSERVICE_VERSION_ID, kg_client, scope="any")
        
        assert context.param.reference_volume in SPC_NAME_TO_KG_ID, f"Expecting reference volume {context.param.reference_volume!r} be in {', '.join(SPC_NAME_TO_KG_ID.keys())}, but is not."

        transform_file = context.get_ooo(lambda proc: proc.name == STRING_CONST.CreateKgTransformFileInstName)
        income_vol_local_file = context.get_ooo(lambda proc: proc.name == STRING_CONST.CreateKgIncVolFileInstName)

        assert transform_file.status == JobProgressEnum.COMPLETED
        assert transform_file.detail
        assert income_vol_local_file.status == JobProgressEnum.COMPLETED
        assert income_vol_local_file.detail

        ref_spc_kg_id = SPC_NAME_TO_KG_ID[context.param.reference_volume]
        spc = CommonCoordinateSpaceVersion.from_id(ref_spc_kg_id, client=kg_client)
        
        lookup_label=f"{context.param.reference_volume}-{context.param.incoming_volume}"
        input_file = LocalFile.from_id(income_vol_local_file.detail, client=kg_client, scope="any")
        output_file = File.from_id(transform_file.detail, client=kg_client, scope="any")

        da = DataAnalysis(
            lookup_label=lookup_label,
            environment=KG_INSTANCES.voluba_webservice_version,
            inputs=[
                spc,
                input_file
            ],
            outputs=[
                output_file
            ],
            description="Programmatically generated by voluba by way of fairgraph.",
            start_time=datetime.now()
        )
        da.save(kg_client, KG_SPACE_NAME)

class DeleteKGInstances(JobProgressModel):
    name:str =STRING_CONST.CreateKGDAName
    ids: List[str]
    def _run(self, context: 'WorkProgress'):
        auth_token = S2SToken.get_token()
        errors = []
        for id in self.ids:
            resp = requests.delete(f"https://{KG_ROOT}/v3/instances/{id}",
                                   headers={
                                        'Authorization': f'Bearer {auth_token}'
                                   })
            if resp.status_code >= 400:
                errors.append({
                    "id": id,
                    "status_code": resp.status_code,
                    "body": resp.text
                })
        if len(errors) > 0:
            print(errors)
            raise Exception(f"Some instances cannot be deleted: {','.join([err.get('id') for err in errors])}")

class WorkProgress(BaseModel):
    id: str
    param: WorkflowV1_1
    output_hash: str=None
    progresses: List[JobProgressModel]

    def get_ooo(self, fn: Callable[[JobProgressModel], bool]) -> JobProgressModel:
        """
        Get one and only one progress
        """
        procs = [proc for proc in self.progresses if fn(proc)]
        if len(procs) != 1:
            raise Exception(f"Expecting one and only one progress, but got {len(procs)}")
        return procs[0]

    def start(self):
        logger.debug(f"Starting {self.id}")
        for proc in self.progresses:
            if proc.status == JobProgressEnum.COMPLETED:
                logger.debug("Completed. Skipping!")
            proc.run(self)

