# Terraform configuration file for GCP landing zone setup
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

resource "google_compute_network" "main" {
  name                    = "cloudwise-vpc"
  auto_create_subnetworks = true
}

resource "google_container_cluster" "gke" {
  name               = "cloudwise-gke"
  location           = var.gcp_region
  initial_node_count = 1
  network            = google_compute_network.main.name
}
