# terraform/cloudfunctions.tf

resource "google_storage_bucket" "cloud_functions_source_bucket" {
  name                        = "${var.gcp_project_id}-cf-source"
  location                    = var.gcp_region
  uniform_bucket_level_access = true
}

// THIS RESOURCE UPLOADS THE ZIP TO GCS
resource "google_storage_bucket_object" "user_auth_function_source_zip" {
  name   = "user-auth-source.zip" // The name of the zip file in the GCS bucket
  bucket = google_storage_bucket.cloud_functions_source_bucket.name
  source = "../user-auth-source.zip" // Path to the local zip file you just created
                                    // Adjust this path if your zip is elsewhere
}

resource "google_cloudfunctions2_function" "user_auth_service" {
  name        = "user-auth-service"
  location    = var.gcp_region
  project     = var.gcp_project_id

  build_config {
    runtime     = "nodejs20" // Your chosen runtime
    entry_point = "handleAuthRequest" // The function name in your Go code
    source {
      storage_source {
        bucket = google_storage_bucket.cloud_functions_source_bucket.name
        // Use the output from the google_storage_bucket_object resource
        object = google_storage_bucket_object.user_auth_function_source_zip.name 
      }
    }
  }

  service_config {
    max_instance_count = 3
    min_instance_count = 0
    available_memory   = "256Mi"
    timeout_seconds    = 60
    all_traffic_on_latest_revision = true
    ingress_settings               = "ALLOW_ALL"
  }

  // Ensure the function depends on the object being created
  depends_on = [
    google_storage_bucket_object.user_auth_function_source_zip
  ]
}

output "user_auth_service_uri" {
  description = "The URI of the user_auth_service Cloud Function."
  value       = google_cloudfunctions2_function.user_auth_service.service_config[0].uri
  sensitive   = true
}

resource "google_cloud_run_service_iam_member" "user_auth_service_invoker" {
  project  = google_cloudfunctions2_function.user_auth_service.project
  location = google_cloudfunctions2_function.user_auth_service.location
  service  = google_cloudfunctions2_function.user_auth_service.name 
  role     = "roles/run.invoker"
  member   = "allUsers"

  depends_on = [google_cloudfunctions2_function.user_auth_service]
}