# Terraform configuration file for AWS landing zone setup
provider "aws" {
  region = var.aws_region
}

# VPC setup
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  
  tags = {
    Name = "cloudwise-vpc"
  }
}

# Subnets & IGW definitions
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

# EKS Cluster shell placeholder
resource "aws_eks_cluster" "eks" {
  name     = "cloudwise-eks"
  role_arn = var.eks_role_arn

  vpc_config {
    subnet_ids = var.subnet_ids
  }
}

# RDS Postgres database instance configuration
resource "aws_db_instance" "postgres" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "15.4"
  instance_class       = "db.t3.micro"
  db_name              = "cloudwise"
  username             = "postgres"
  password             = var.db_password
  skip_final_snapshot  = true
}

# S3 report exports bucket
resource "aws_s3_bucket" "reports" {
  bucket = "cloudwise-executive-reports-bucket"
}
