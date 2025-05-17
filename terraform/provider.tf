# terraform/provider.tf

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
  zone    = var.gcp_zone
}


# terraform/variables.tf

variable "gcp_project_id" {
  description = "The GCP Project ID to deploy resources into."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region to deploy resources into."
  type        = string
  default     = "us-central1" 
}

variable "gcp_zone" {
  description = "The GCP zone for regional resources if needed."
  type        = string
  default     = "us-central1-a"
}

variable "terraform_state_bucket_name" {
  description = "The name of the GCS bucket to store Terraform state."
  type        = string
}