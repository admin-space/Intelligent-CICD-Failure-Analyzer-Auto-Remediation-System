import boto3
from botocore.config import Config
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

cfg = Config(connect_timeout=3, read_timeout=3, retries={'max_attempts': 1})
session = boto3.Session(aws_access_key_id=access_key, aws_secret_access_key=secret_key)

print("Checking IAM policies for user/Jenkins...", flush=True)
try:
    iam = session.client('iam', config=cfg)
    attached = iam.list_attached_user_policies(UserName='Jenkins')
    print("Attached policies:", attached.get('AttachedPolicies', []), flush=True)
    inline = iam.list_user_policies(UserName='Jenkins')
    print("Inline policies:", inline.get('PolicyNames', []), flush=True)
except Exception as e:
    print("IAM query error:", e, flush=True)
