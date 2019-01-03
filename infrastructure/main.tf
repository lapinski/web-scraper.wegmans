provider "google" {
  project = "wegmans-web-scraper"
  region = "us-east4"
  zone = "us-east4-a"
}

resource "google_compute_instance" "vm_instance" {
  name = "terraform-instance"
  machine_type = "f1-micro"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-9"
    }
  }

  network_interface {
    network = "${google_compute_network.vpc_network.self_link}"
    access_config { }
  }
}

resource "google_compute_network" "vpc_network" {
  name = "terraform-network"
  auto_create_subnetworks = "true"
}