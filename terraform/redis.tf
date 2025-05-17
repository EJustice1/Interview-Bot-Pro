# terraform/redis.tf

resource "google_redis_instance" "session_cache" {
  name           = "${var.gcp_project_id}-session-cache"
  tier           = "BASIC" // Or "STANDARD_HA" for high availability (more expensive)
  memory_size_gb = 1
  location_id    = var.gcp_zone 
  region         = var.gcp_region 

  // Ensure the necessary Service Networking API is enabled and a network is configured
  // This might require setting up a VPC connector if your functions need to access Redis
  // For Cloud Functions Gen 2, direct VPC egress is simpler.
  // For Cloud Functions Gen 1, a Serverless VPC Access connector is needed.
  // We will address network configuration if needed when defining Cloud Functions.
  // For now, this defines the instance.
  // connect_mode = "DIRECT_PEERING" // Default
}

output "redis_instance_host" {
  description = "The host IP address of the Redis instance."
  value       = google_redis_instance.session_cache.host
  sensitive   = true // Host IP can be considered sensitive
}

output "redis_instance_port" {
  description = "The port number of the Redis instance."
  value       = google_redis_instance.session_cache.port
}
