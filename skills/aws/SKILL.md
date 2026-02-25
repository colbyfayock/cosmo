# AWS Skill

*AWS CLI for EC2, SSM, S3, and more.*

## Usage

```bash
# Get help
aws --help

# Service-specific help
aws ssm get-parameter --help
aws ec2 describe-instances --help
```

## Common Commands

```bash
# Get SSM parameter
aws ssm get-parameter --name "/nanobot/KEY_NAME" --with-decryption

# List EC2 instances
aws ec2 describe-instances
```

## Docs

See `aws --help` or visit https://aws.amazon.com/cli/
EOF # Create aws skill