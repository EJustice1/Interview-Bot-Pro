# terraform/firestore.tf

resource "google_firestore_database" "default" {
  project                     = var.gcp_project_id
  name                        = "(default)" // For the default Firestore database in a project
  location_id                 = var.gcp_region // Or a multi-region like "nam5" (US Multi-region)
                                            // Choose based on your latency and availability needs
  type                        = "FIRESTORE_NATIVE"
  app_engine_integration_mode = "DISABLED"
}

output "firestore_database_name" {
  description = "The name of the Firestore database."
  value       = google_firestore_database.default.name
}