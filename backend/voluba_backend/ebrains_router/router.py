from voluba_store import VolubaStore

from .models import StartWorkflowResp, WorkflowV1_1, WorkProgress, UploadToDP, CreateKgTransformFileInstance, CreateKgIncVolFileInstance, CreateKgDataAnalysisInstance

from uuid import uuid4
from fastapi import APIRouter, Request, BackgroundTasks, Cookie, Depends
from fastapi.exceptions import HTTPException
from fastapi.responses import Response

from voluba_user import get_user

worflow_store = VolubaStore()

router = APIRouter()

# TODO add check that user is authenticated

@router.post("", response_model=StartWorkflowResp)
def start_workflow(body: WorkflowV1_1, request: Request, bg: BackgroundTasks):
    job_id = str(uuid4())
    result=StartWorkflowResp(job_id=job_id)
    work=WorkProgress(
        id=result.job_id,
        param=body,
        progresses=[
            UploadToDP(),
            CreateKgTransformFileInstance(),
            CreateKgIncVolFileInstance(),
            CreateKgDataAnalysisInstance(),
        ]
    )
    worflow_store.set_value(job_id, work)
    bg.add_task(work.start)
    return result

@router.get("/{job_id:str}", response_model=WorkProgress)
def query_workflow(job_id:str, request: Request):
    val = worflow_store.get_value(job_id)
    if not val:
        raise HTTPException(404, detail=f"Cannot find task with id {job_id!r}")
    return val

@router.delete("/{job_id:str}")
def delete_workflow(job_id:str, request: Request):
    worflow_store.delete_value(job_id)


@router.put("/{job_id:str}")
def retry_workflow(job_id:str, request: Request, bg: BackgroundTasks):
    val = worflow_store.get_value(job_id)
    if not val:
        raise HTTPException(404, detail=f"Cannot find task with id {job_id!r}")
    bg.add_task(val.start)
    return Response(204)
