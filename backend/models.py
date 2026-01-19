from pydantic import BaseModel
from typing import List

class JDRequest(BaseModel):
    job_description : str
    user_skills : List[str]