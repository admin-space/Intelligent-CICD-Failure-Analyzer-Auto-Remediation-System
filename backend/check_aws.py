import boto3
from botocore.config import Config
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')

access_key = os.getenv('AWS_ACCESS_KEY_ID')
secret_key = os.getenv('AWS_SECRET_ACCESS_KEY')

print(f"Loaded credentials for key: {access_key[:8]}...", flush=True)

cfg = Config(connect_timeout=3, read_timeout=3, retries={'max_attempts': 1})

session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
)

# 1. Test STS
try:
    sts = session.client('sts', config=cfg)
    identity = sts.get_caller_identity()
    print("STS Caller Identity:", identity.get('Arn'), flush=True)
except Exception as e:
    print("STS Error:", e, flush=True)

# 2. Test S3
try:
    s3 = session.client('s3', config=cfg)
    buckets = s3.list_buckets().get('Buckets', [])
    print(f"S3 Buckets ({len(buckets)} found):", [b['Name'] for b in buckets], flush=True)
except Exception as e:
    print("S3 Error:", e, flush=True)

# 3. Test EC2 in multiple regions
regions_to_test = ['ap-south-1', 'us-east-1', 'us-east-2', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
for r in regions_to_test:
    try:
        ec2 = session.client('ec2', region_name=r, config=cfg)
        res = ec2.describe_instances()
        instances = []
        for rsv in res.get('Reservations', []):
            for inst in rsv.get('Instances', []):
                name = inst.get('InstanceId')
                for tag in inst.get('Tags', []):
                    if tag.get('Key') == 'Name':
                        name = tag.get('Value')
                instances.append({
                    "id": inst.get('InstanceId'),
                    "name": name,
                    "type": inst.get('InstanceType'),
                    "state": inst.get('State', {}).get('Name'),
                    "ip": inst.get('PublicIpAddress', inst.get('PrivateIpAddress'))
                })
        print(f"EC2 Region [{r}]: {len(instances)} instances found -> {instances}", flush=True)
    except Exception as e:
        print(f"EC2 Region [{r}] Error: {e}", flush=True)

# 4. Test EBS in regions
for r in ['ap-south-1', 'us-east-1']:
    try:
        ec2 = session.client('ec2', region_name=r, config=cfg)
        vols = ec2.describe_volumes().get('Volumes', [])
        print(f"EBS Region [{r}]: {len(vols)} volumes found -> {[v.get('VolumeId') for v in vols]}", flush=True)
    except Exception as e:
        print(f"EBS Region [{r}] Error: {e}", flush=True)
